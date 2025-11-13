from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Note
from .serializers import NoteSerializer, UserSerializer


class UserRegistrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.user_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='testuser').exists())
        self.assertEqual(response.data['username'], 'testuser')
        self.assertNotIn('password', response.data)

    def test_user_registration_duplicate_username(self):
        """Test registration with duplicate username"""
        # Create user first
        User.objects.create_user(username='testuser', password='testpass123')
        
        # Try to register with same username
        response = self.client.post(self.register_url, self.user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_user_registration_missing_fields(self):
        """Test registration with missing required fields"""
        incomplete_data = {'username': 'testuser'}
        response = self.client.post(self.register_url, incomplete_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)


class NoteModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.note = Note.objects.create(
            title='Test Note',
            content='This is a test note content',
            author=self.user
        )

    def test_note_creation(self):
        """Test note model creation"""
        self.assertEqual(self.note.title, 'Test Note')
        self.assertEqual(self.note.content, 'This is a test note content')
        self.assertEqual(self.note.author, self.user)
        self.assertIsNotNone(self.note.create_at)

    def test_note_string_representation(self):
        """Test note string representation"""
        self.assertEqual(str(self.note), 'Test Note')


class NoteAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.other_user = User.objects.create_user(username='otheruser', password='testpass123')
        self.note = Note.objects.create(
            title='Test Note',
            content='This is a test note content',
            author=self.user
        )
        self.note_data = {
            'title': 'New Note',
            'content': 'This is new note content'
        }

    def test_note_list_authenticated(self):
        """Test that authenticated users can list their notes"""
        self.client.force_authenticate(user=self.user)
        url = reverse('note-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Note')

    def test_note_list_unauthenticated(self):
        """Test that unauthenticated users cannot access notes"""
        url = reverse('note-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_note_create_authenticated(self):
        """Test that authenticated users can create notes"""
        self.client.force_authenticate(user=self.user)
        url = reverse('note-list')
        response = self.client.post(url, self.note_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Note.objects.count(), 2)
        self.assertEqual(response.data['title'], 'New Note')
        self.assertEqual(response.data['author'], self.user.id)

    def test_note_create_unauthenticated(self):
        """Test that unauthenticated users cannot create notes"""
        url = reverse('note-list')
        response = self.client.post(url, self.note_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Note.objects.count(), 1)

    def test_note_delete_owner(self):
        """Test that note owners can delete their notes"""
        self.client.force_authenticate(user=self.user)
        url = reverse('delete-note', kwargs={'pk': self.note.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Note.objects.count(), 0)

    def test_note_delete_non_owner(self):
        """Test that users cannot delete other users' notes"""
        self.client.force_authenticate(user=self.other_user)
        url = reverse('delete-note', kwargs={'pk': self.note.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(Note.objects.count(), 1)


class JWTAuthenticationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }

    def test_obtain_token(self):
        """Test JWT token obtainment"""
        url = reverse('get_token')
        response = self.client.post(url, self.login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_obtain_token_invalid_credentials(self):
        """Test token obtainment with invalid credentials"""
        invalid_data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        url = reverse('get_token')
        response = self.client.post(url, invalid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('access', response.data)

    def test_refresh_token(self):
        """Test JWT token refresh"""
        # First obtain token
        url = reverse('get_token')
        response = self.client.post(url, self.login_data, format='json')
        refresh_token = response.data['refresh']
        
        # Then refresh token
        refresh_url = reverse('refresh')
        refresh_data = {'refresh': refresh_token}
        refresh_response = self.client.post(refresh_url, refresh_data, format='json')
        
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)


class UserSerializerTest(TestCase):
    def test_user_serializer_create(self):
        """Test user serializer creation"""
        data = {
            'username': 'newuser',
            'password': 'newpass123'
        }
        serializer = UserSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.username, 'newuser')
        self.assertTrue(user.check_password('newpass123'))

    def test_user_serializer_password_write_only(self):
        """Test that password is write-only in serializer"""
        user = User.objects.create_user(username='testuser', password='testpass123')
        serializer = UserSerializer(user)
        
        serialized_data = serializer.data
        self.assertNotIn('password', serialized_data)


class NoteSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_note_serializer_valid_data(self):
        """Test note serializer with valid data"""
        note = Note.objects.create(
            title='Test Note',
            content='Test content',
            author=self.user
        )
        from .serializers import NoteSerializer
        serializer = NoteSerializer(note)
        
        data = serializer.data
        self.assertEqual(data['title'], 'Test Note')
        self.assertEqual(data['content'], 'Test content')
        self.assertEqual(data['author'], self.user.id)
        
    def test_note_serializer_author_read_only(self):
        """Test that author field is read-only"""
        data = {
            'title': 'Test Note',
            'content': 'Test content',
            'author': 999  # Should be ignored
        }
        from .serializers import NoteSerializer
        serializer = NoteSerializer(data=data)
        
        self.assertTrue(serializer.is_valid())
