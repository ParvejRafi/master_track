import uuid

from django.conf import settings
from django.db import models


class OwnedModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='%(class)ss'
    )
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class University(OwnedModel):
    class Type(models.TextChoices):
        PUBLIC = 'Public'
        PRIVATE = 'Private'
        RESEARCH = 'Research'
        OTHER = 'Other'

    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=16, choices=Type.choices, default=Type.PUBLIC)
    website = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Program(OwnedModel):
    universityId = models.ForeignKey(
        University, on_delete=models.CASCADE, related_name='programs'
    )
    name = models.CharField(max_length=255)
    degree = models.CharField(max_length=255, blank=True)
    specialization = models.CharField(max_length=255, blank=True)
    duration = models.CharField(max_length=100, blank=True)
    language = models.CharField(max_length=100, blank=True)
    website = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Application(OwnedModel):
    class Status(models.TextChoices):
        RESEARCHING = 'Researching'
        INTERESTED = 'Interested'
        ELIGIBILITY_CHECK = 'Eligibility Check'
        PREPARING = 'Preparing'
        APPLICATION_STARTED = 'Application Started'
        READY_TO_SUBMIT = 'Ready to Submit'
        SUBMITTED = 'Submitted'
        UNDER_REVIEW = 'Under Review'
        INTERVIEW = 'Interview'
        ACCEPTED = 'Accepted'
        REJECTED = 'Rejected'
        WAITLISTED = 'Waitlisted'
        WITHDRAWN = 'Withdrawn'

    class Priority(models.TextChoices):
        DREAM = 'Dream'
        TARGET = 'Target'
        SAFE = 'Safe'
        BACKUP = 'Backup'

    class Funding(models.TextChoices):
        FULLY_FUNDED = 'Fully Funded'
        PARTIAL = 'Partial'
        SELF_FUNDED = 'Self-Funded'
        UNKNOWN = 'Unknown'

    programId = models.ForeignKey(
        Program, on_delete=models.CASCADE, related_name='applications'
    )
    universityId = models.ForeignKey(
        University, on_delete=models.CASCADE, related_name='applications'
    )
    opensDate = models.CharField(max_length=32, blank=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.RESEARCHING)
    priority = models.CharField(max_length=16, choices=Priority.choices, default=Priority.TARGET)
    deadline = models.CharField(max_length=32, blank=True)
    funding = models.CharField(max_length=16, choices=Funding.choices, default=Funding.UNKNOWN)
    progress = models.IntegerField(default=0)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f'{self.universityId_id} / {self.programId_id}'


class Task(OwnedModel):
    class Priority(models.TextChoices):
        LOW = 'low'
        MEDIUM = 'medium'
        HIGH = 'high'

    class Status(models.TextChoices):
        TODO = 'todo'
        IN_PROGRESS = 'in_progress'
        DONE = 'done'

    class Category(models.TextChoices):
        RESEARCH = 'Research'
        DOCUMENTS = 'Documents'
        SOP = 'SOP'
        RECOMMENDATION = 'Recommendation'
        APPLICATION = 'Application'
        SCHOLARSHIP = 'Scholarship'
        VISA = 'Visa'
        OTHER = 'Other'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    applicationId = models.ForeignKey(
        Application, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks'
    )
    universityId = models.ForeignKey(
        University, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks'
    )
    priority = models.CharField(max_length=16, choices=Priority.choices, default=Priority.MEDIUM)
    dueDate = models.CharField(max_length=32, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.TODO)
    category = models.CharField(max_length=32, choices=Category.choices, default=Category.RESEARCH)

    def __str__(self):
        return self.title


class Document(OwnedModel):
    class Category(models.TextChoices):
        ACADEMIC = 'Academic'
        IDENTITY = 'Identity'
        ENGLISH_TEST = 'English Test'
        CERTIFICATIONS = 'Certifications'
        EXPERIENCE = 'Experience'
        APPLICATION = 'Application'
        SCHOLARSHIP = 'Scholarship'
        OTHER = 'Other'

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=32, choices=Category.choices, default=Category.OTHER)
    fileUrl = models.TextField(blank=True)
    expiryDate = models.CharField(max_length=32, blank=True)
    description = models.TextField(blank=True)
    tags = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return self.name


class Note(OwnedModel):
    class Category(models.TextChoices):
        ADMISSION = 'Admission'
        SCHOLARSHIP = 'Scholarship'
        FUNDING = 'Funding'
        FACULTY = 'Faculty'
        RESEARCH = 'Research'
        APPLICATION = 'Application'
        VISA = 'Visa'
        PERSONAL = 'Personal'
        OTHER = 'Other'

    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    category = models.CharField(max_length=16, choices=Category.choices, default=Category.OTHER)
    universityId = models.ForeignKey(
        University, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_notes'
    )
    programId = models.ForeignKey(
        Program, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_notes'
    )
    applicationId = models.ForeignKey(
        Application, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_notes'
    )

    def __str__(self):
        return self.title


class Professor(OwnedModel):
    class ContactStatus(models.TextChoices):
        NOT_CONTACTED = 'Not Contacted'
        RESEARCHING = 'Researching'
        DRAFTING_EMAIL = 'Drafting Email'
        EMAILED = 'Emailed'
        REPLIED = 'Replied'
        NO_RESPONSE = 'No Response'
        MEETING_SCHEDULED = 'Meeting Scheduled'
        NOT_PURSUING = 'Not Pursuing'

    class Priority(models.TextChoices):
        HIGH = 'High'
        MEDIUM = 'Medium'
        LOW = 'Low'

    universityId = models.ForeignKey(
        University, on_delete=models.CASCADE, related_name='professors'
    )
    programId = models.ForeignKey(
        Program, on_delete=models.SET_NULL, null=True, blank=True, related_name='professors'
    )
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    email = models.CharField(max_length=255, blank=True)
    profileUrl = models.CharField(max_length=500, blank=True)
    labName = models.CharField(max_length=255, blank=True)
    labUrl = models.CharField(max_length=500, blank=True)
    researchAreas = models.CharField(max_length=500, blank=True)
    papers = models.JSONField(default=list, blank=True)
    fitNotes = models.TextField(blank=True)
    contactStatus = models.CharField(
        max_length=32, choices=ContactStatus.choices, default=ContactStatus.NOT_CONTACTED
    )
    priority = models.CharField(max_length=16, choices=Priority.choices, default=Priority.MEDIUM)
    lastContactedDate = models.CharField(max_length=32, blank=True)

    def __str__(self):
        return self.name


class Scholarship(OwnedModel):
    class Level(models.TextChoices):
        BACHELOR = 'Bachelor'
        MASTER = 'Master'
        PHD = 'PhD'
        ANY = 'Any'

    class Status(models.TextChoices):
        RESEARCHING = 'Researching'
        PREPARING = 'Preparing'
        APPLYING = 'Applying'
        SUBMITTED = 'Submitted'
        AWARDED = 'Awarded'
        REJECTED = 'Rejected'
        WITHDRAWN = 'Withdrawn'

    name = models.CharField(max_length=255)
    provider = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=100, blank=True)
    level = models.CharField(max_length=16, choices=Level.choices, default=Level.MASTER)
    amount = models.CharField(max_length=64, blank=True)
    currency = models.CharField(max_length=8, blank=True)
    deadline = models.CharField(max_length=32, blank=True)
    startDate = models.CharField(max_length=32, blank=True)
    endDate = models.CharField(max_length=32, blank=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.RESEARCHING)
    eligibility = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    description = models.TextField(blank=True)
    tags = models.CharField(max_length=500, blank=True)
    website = models.CharField(max_length=500, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Conference(OwnedModel):
    class Type(models.TextChoices):
        ACADEMIC = 'Academic'
        INDUSTRY = 'Industry'
        WORKSHOP = 'Workshop'
        POSTER = 'Poster'
        KEYNOTE = 'Keynote'
        VIRTUAL = 'Virtual'
        OTHER = 'Other'

    class Status(models.TextChoices):
        RESEARCHING = 'Researching'
        PREPARING = 'Preparing'
        SUBMITTING = 'Submitting'
        SUBMITTED = 'Submitted'
        ACCEPTED = 'Accepted'
        REJECTED = 'Rejected'
        ATTENDING = 'Attending'
        WITHDRAWN = 'Withdrawn'

    name = models.CharField(max_length=255)
    organizer = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=32, choices=Type.choices, default=Type.ACADEMIC)
    startDate = models.CharField(max_length=32, blank=True)
    endDate = models.CharField(max_length=32, blank=True)
    deadline = models.CharField(max_length=32, blank=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.RESEARCHING)
    website = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    tags = models.CharField(max_length=500, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name
