"""Pruebas de seguridad Fase 1 (S1, S6).

S1: un usuario con rol administrativo NO Superadmin no puede gestionar
roles ni usuarios (escalada de privilegios).
S6: producción debe validar la fortaleza de las contraseñas.
"""
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from apps.usuarios.models import Rol, UsuarioRol


def crear_moderador(username='moderador_s1'):
    user = User.objects.create_user(username=username, password='Mod12345!')
    rol, _ = Rol.objects.get_or_create(
        nombre='Moderador', defaults={'descripcion': 'Moderador'}
    )
    UsuarioRol.objects.get_or_create(usuario=user, rol=rol)
    user.refresh_from_db()
    return user


def crear_superadmin(username='superadmin_s1'):
    return User.objects.create_user(
        username=username, password='Sup12345!',
        is_staff=True, is_superuser=True,
    )


class S1AsignarRolTest(TestCase):
    """Un Moderador no puede asignarse (ni asignar) el rol Superadmin."""

    def setUp(self):
        self.client = APIClient()
        self.moderador = crear_moderador()
        # El rol Superadmin existe de antemano (no debe crearse al vuelo).
        Rol.objects.get_or_create(
            nombre='Superadmin', defaults={'descripcion': 'Superadmin'}
        )

    def test_moderador_no_puede_asignarse_superadmin(self):
        self.client.force_authenticate(user=self.moderador)
        resp = self.client.post('/api/roles/asignar/', {
            'usuario': self.moderador.pk, 'rol': 'Superadmin',
        }, format='json')
        self.assertIn(resp.status_code, [401, 403])
        self.assertFalse(
            UsuarioRol.objects.filter(
                usuario=self.moderador, rol__nombre='Superadmin'
            ).exists()
        )

    def test_no_crea_roles_inexistentes_al_vuelo(self):
        admin = crear_superadmin()
        self.client.force_authenticate(user=admin)
        resp = self.client.post('/api/roles/asignar/', {
            'usuario': self.moderador.pk, 'rol': 'RolInventadoQueNoExiste',
        }, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(Rol.objects.filter(nombre='RolInventadoQueNoExiste').exists())

    def test_superadmin_si_puede_asignar_rol_existente(self):
        admin = crear_superadmin()
        self.client.force_authenticate(user=admin)
        resp = self.client.post('/api/roles/asignar/', {
            'usuario': self.moderador.pk, 'rol': 'Superadmin',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(
            UsuarioRol.objects.filter(
                usuario=self.moderador, rol__nombre='Superadmin'
            ).exists()
        )


class S1GestionUsuariosTest(TestCase):
    """Un Moderador no puede cambiar is_staff ni eliminar administradores."""

    def setUp(self):
        self.client = APIClient()
        self.moderador = crear_moderador()
        self.victima = User.objects.create_user(
            username='victima_s1', password='Vic12345!')

    def test_moderador_no_puede_dar_is_staff(self):
        self.client.force_authenticate(user=self.moderador)
        resp = self.client.patch(f'/api/usuarios/{self.victima.pk}/', {
            'is_staff': True,
        }, format='json')
        self.assertIn(resp.status_code, [401, 403])
        self.victima.refresh_from_db()
        self.assertFalse(self.victima.is_staff)

    def test_moderador_no_puede_eliminar_otro_admin(self):
        otro_admin = crear_superadmin(username='otro_admin_s1')
        self.client.force_authenticate(user=self.moderador)
        resp = self.client.delete(f'/api/usuarios/{otro_admin.pk}/')
        self.assertIn(resp.status_code, [401, 403])
        self.assertTrue(User.objects.filter(pk=otro_admin.pk).exists())


class S6PasswordValidatorsProdTest(TestCase):
    """prod.py debe declarar validadores (no heredar la lista vacía de local)."""

    def test_prod_declara_validadores_propios(self):
        import pathlib
        prod = pathlib.Path(__file__).resolve().parent.parent.parent / 'config' / 'settings' / 'prod.py'
        fuente = prod.read_text(encoding='utf-8')
        self.assertIn('AUTH_PASSWORD_VALIDATORS', fuente)
        self.assertIn('MinimumLengthValidator', fuente)

    def test_password_debil_rechazada_con_validadores_prod(self):
        from django.test import override_settings
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        validadores = [
            {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
            {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
             'OPTIONS': {'min_length': 8}},
            {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
            {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
        ]
        with override_settings(AUTH_PASSWORD_VALIDATORS=validadores):
            with self.assertRaises(ValidationError):
                validate_password('1')
