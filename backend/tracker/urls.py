from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ApplicationViewSet,
    ConferenceViewSet,
    DocumentViewSet,
    ExportView,
    ImportView,
    NoteViewSet,
    ProfessorViewSet,
    ProgramViewSet,
    ScholarshipViewSet,
    TaskViewSet,
    UniversityViewSet,
)

router = DefaultRouter()
router.register('universities', UniversityViewSet, basename='university')
router.register('programs', ProgramViewSet, basename='program')
router.register('applications', ApplicationViewSet, basename='application')
router.register('tasks', TaskViewSet, basename='task')
router.register('documents', DocumentViewSet, basename='document')
router.register('notes', NoteViewSet, basename='note')
router.register('professors', ProfessorViewSet, basename='professor')
router.register('scholarships', ScholarshipViewSet, basename='scholarship')
router.register('conferences', ConferenceViewSet, basename='conference')

urlpatterns = [
    path('export/', ExportView.as_view(), name='export'),
    path('import/', ImportView.as_view(), name='import'),
    path('', include(router.urls)),
]
