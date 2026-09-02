from django.db import transaction
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Application, Conference, Document, Note, Professor, Program, Scholarship, Task, University
from .serializers import (
    ApplicationSerializer,
    ConferenceSerializer,
    DocumentSerializer,
    NoteSerializer,
    ProfessorSerializer,
    ProgramSerializer,
    ScholarshipSerializer,
    TaskSerializer,
    UniversitySerializer,
)


class OwnerQuerysetMixin:
    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class UniversityViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer


class ProgramViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    filterset_fields = ['universityId']


class ApplicationViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    filterset_fields = ['universityId', 'programId', 'status']


class TaskViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filterset_fields = ['applicationId', 'universityId', 'status']


class DocumentViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer


class NoteViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    filterset_fields = ['universityId', 'programId', 'applicationId']


class ProfessorViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Professor.objects.all()
    serializer_class = ProfessorSerializer
    filterset_fields = ['universityId', 'programId', 'contactStatus']


class ScholarshipViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer
    filterset_fields = ['country', 'level', 'status']


class ConferenceViewSet(OwnerQuerysetMixin, viewsets.ModelViewSet):
    queryset = Conference.objects.all()
    serializer_class = ConferenceSerializer
    filterset_fields = ['country', 'type', 'status']


RESOURCE_SERIALIZERS = {
    'universities': UniversitySerializer,
    'programs': ProgramSerializer,
    'applications': ApplicationSerializer,
    'tasks': TaskSerializer,
    'documents': DocumentSerializer,
    'notes': NoteSerializer,
    'professors': ProfessorSerializer,
    'scholarships': ScholarshipSerializer,
    'conferences': ConferenceSerializer,
}

RESOURCE_MODELS = {
    'universities': University,
    'programs': Program,
    'applications': Application,
    'tasks': Task,
    'documents': Document,
    'notes': Note,
    'professors': Professor,
    'scholarships': Scholarship,
    'conferences': Conference,
}

# Order matters for import: parents before children referencing them.
IMPORT_ORDER = ['universities', 'programs', 'applications', 'tasks', 'documents', 'notes', 'professors', 'scholarships', 'conferences']


class ExportView(APIView):
    def get(self, request):
        data = {}
        for key, model in RESOURCE_MODELS.items():
            serializer_cls = RESOURCE_SERIALIZERS[key]
            qs = model.objects.filter(owner=request.user)
            data[key] = serializer_cls(qs, many=True, context={'request': request}).data
        return Response(data)


class ImportView(APIView):
    def post(self, request):
        payload = request.data
        created_counts = {}
        with transaction.atomic():
            for key in IMPORT_ORDER:
                rows = payload.get(key) or []
                serializer_cls = RESOURCE_SERIALIZERS[key]
                created = 0
                for row in rows:
                    # Keep the client-generated id so FK references between
                    # resources (e.g. a program's universityId) still resolve.
                    row = {k: v for k, v in row.items() if k not in ('createdAt', 'updatedAt')}
                    serializer = serializer_cls(data=row, context={'request': request})
                    serializer.is_valid(raise_exception=True)
                    serializer.save(owner=request.user)
                    created += 1
                created_counts[key] = created
        return Response({'created': created_counts})
