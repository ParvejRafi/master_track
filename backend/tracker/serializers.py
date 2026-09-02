from rest_framework import serializers

from .models import Application, Conference, Document, Note, Professor, Program, Scholarship, Task, University


class OwnedModelSerializer(serializers.ModelSerializer):
    # Writable so the local-data import can preserve client-generated ids
    # (foreign keys in imported rows reference these ids directly).
    id = serializers.UUIDField(required=False)
    createdAt = serializers.DateTimeField(read_only=True)
    updatedAt = serializers.DateTimeField(read_only=True)


class UniversitySerializer(OwnedModelSerializer):
    class Meta:
        model = University
        fields = [
            'id', 'name', 'country', 'city', 'type', 'website',
            'description', 'notes', 'createdAt', 'updatedAt',
        ]


class ProgramSerializer(OwnedModelSerializer):
    universityId = serializers.PrimaryKeyRelatedField(queryset=University.objects.none())

    class Meta:
        model = Program
        fields = [
            'id', 'universityId', 'name', 'degree', 'specialization', 'duration',
            'language', 'website', 'description', 'notes', 'createdAt', 'updatedAt',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request is not None:
            self.fields['universityId'].queryset = University.objects.filter(owner=request.user)


class ApplicationSerializer(OwnedModelSerializer):
    programId = serializers.PrimaryKeyRelatedField(queryset=Program.objects.none())
    universityId = serializers.PrimaryKeyRelatedField(queryset=University.objects.none())

    class Meta:
        model = Application
        fields = [
            'id', 'programId', 'universityId', 'opensDate', 'status', 'priority',
            'deadline', 'funding', 'progress', 'notes', 'createdAt', 'updatedAt',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request is not None:
            self.fields['programId'].queryset = Program.objects.filter(owner=request.user)
            self.fields['universityId'].queryset = University.objects.filter(owner=request.user)


class TaskSerializer(OwnedModelSerializer):
    applicationId = serializers.PrimaryKeyRelatedField(
        queryset=Application.objects.none(), required=False, allow_null=True
    )
    universityId = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.none(), required=False, allow_null=True
    )

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'applicationId', 'universityId',
            'priority', 'dueDate', 'status', 'category', 'createdAt',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request is not None:
            self.fields['applicationId'].queryset = Application.objects.filter(owner=request.user)
            self.fields['universityId'].queryset = University.objects.filter(owner=request.user)


class DocumentSerializer(OwnedModelSerializer):
    class Meta:
        model = Document
        fields = [
            'id', 'name', 'category', 'fileUrl', 'expiryDate',
            'description', 'tags', 'createdAt',
        ]


class NoteSerializer(OwnedModelSerializer):
    universityId = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.none(), required=False, allow_null=True
    )
    programId = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.none(), required=False, allow_null=True
    )
    applicationId = serializers.PrimaryKeyRelatedField(
        queryset=Application.objects.none(), required=False, allow_null=True
    )

    class Meta:
        model = Note
        fields = [
            'id', 'title', 'content', 'category', 'universityId', 'programId',
            'applicationId', 'createdAt', 'updatedAt',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request is not None:
            self.fields['universityId'].queryset = University.objects.filter(owner=request.user)
            self.fields['programId'].queryset = Program.objects.filter(owner=request.user)
            self.fields['applicationId'].queryset = Application.objects.filter(owner=request.user)


class ProfessorSerializer(OwnedModelSerializer):
    universityId = serializers.PrimaryKeyRelatedField(queryset=University.objects.none())
    programId = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.none(), required=False, allow_null=True
    )

    class Meta:
        model = Professor
        fields = [
            'id', 'universityId', 'programId', 'name', 'title', 'department', 'email',
            'profileUrl', 'labName', 'labUrl', 'researchAreas', 'papers', 'fitNotes',
            'contactStatus', 'priority', 'lastContactedDate', 'createdAt', 'updatedAt',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request is not None:
            self.fields['universityId'].queryset = University.objects.filter(owner=request.user)
            self.fields['programId'].queryset = Program.objects.filter(owner=request.user)


class ScholarshipSerializer(OwnedModelSerializer):
    class Meta:
        model = Scholarship
        fields = [
            'id', 'name', 'provider', 'country', 'level', 'amount', 'currency',
            'deadline', 'startDate', 'endDate', 'status', 'eligibility', 'requirements',
            'description', 'tags', 'website', 'notes', 'createdAt', 'updatedAt',
        ]


class ConferenceSerializer(OwnedModelSerializer):
    class Meta:
        model = Conference
        fields = [
            'id', 'name', 'organizer', 'location', 'country', 'type',
            'startDate', 'endDate', 'deadline', 'status', 'website',
            'description', 'tags', 'notes', 'createdAt', 'updatedAt',
        ]
