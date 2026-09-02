from django.contrib import admin

from .models import Application, Document, Note, Professor, Program, Task, University

admin.site.register(University)
admin.site.register(Program)
admin.site.register(Application)
admin.site.register(Task)
admin.site.register(Document)
admin.site.register(Note)
admin.site.register(Professor)
