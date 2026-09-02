from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import NotificationSettings
from tracker.models import Application, Conference, Scholarship, Task

User = get_user_model()

EXCLUDED_APPLICATION_STATUSES = {'Accepted', 'Rejected', 'Withdrawn'}
EXCLUDED_SCHOLARSHIP_STATUSES = {'Awarded', 'Rejected', 'Withdrawn'}
EXCLUDED_CONFERENCE_STATUSES = {'Rejected', 'Withdrawn'}


def parse_date(value: str):
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def in_window(value: str, today: date, days_ahead: int) -> bool:
    d = parse_date(value)
    if d is None:
        return False
    return today <= d <= today + timedelta(days=days_ahead)


class Command(BaseCommand):
    help = 'Sends each user a digest email of applications, tasks, scholarships and conferences with upcoming dates.'

    def handle(self, *args, **options):
        today = timezone.localdate()
        sent_count = 0

        for user in User.objects.filter(is_active=True).exclude(email=''):
            settings_obj, _ = NotificationSettings.objects.get_or_create(user=user)
            if not settings_obj.email_reminders_enabled:
                continue

            days_ahead = settings_obj.remind_days_ahead
            sections = self._build_sections(user, today, days_ahead)

            if not any(sections.values()):
                continue

            body = self._render_body(sections, days_ahead)
            send_mail(
                subject=f'MasterTrack: {sum(len(v) for v in sections.values())} upcoming item(s) in the next {days_ahead} days',
                message=body,
                from_email=None,
                recipient_list=[user.email],
            )
            settings_obj.last_sent_at = timezone.now()
            settings_obj.save(update_fields=['last_sent_at'])
            sent_count += 1

        self.stdout.write(self.style.SUCCESS(f'Sent {sent_count} reminder email(s).'))

    def _build_sections(self, user, today, days_ahead):
        applications = [
            a for a in Application.objects.filter(owner=user).exclude(status__in=EXCLUDED_APPLICATION_STATUSES)
            if in_window(a.opensDate, today, days_ahead) or in_window(a.deadline, today, days_ahead)
        ]
        tasks = [
            t for t in Task.objects.filter(owner=user).exclude(status='done')
            if in_window(t.dueDate, today, days_ahead)
        ]
        scholarships = [
            s for s in Scholarship.objects.filter(owner=user).exclude(status__in=EXCLUDED_SCHOLARSHIP_STATUSES)
            if in_window(s.deadline, today, days_ahead)
        ]
        conferences = [
            c for c in Conference.objects.filter(owner=user).exclude(status__in=EXCLUDED_CONFERENCE_STATUSES)
            if in_window(c.deadline, today, days_ahead)
        ]
        return {
            'applications': applications,
            'tasks': tasks,
            'scholarships': scholarships,
            'conferences': conferences,
        }

    def _render_body(self, sections, days_ahead):
        lines = [f'Here is what is coming up in the next {days_ahead} days:', '']

        if sections['applications']:
            lines.append('APPLICATIONS')
            for a in sections['applications']:
                if in_window(a.deadline, timezone.localdate(), days_ahead):
                    lines.append(f'  - {a.universityId.name}: deadline {a.deadline} ({a.status})')
                if in_window(a.opensDate, timezone.localdate(), days_ahead):
                    lines.append(f'  - {a.universityId.name}: opens {a.opensDate}')
            lines.append('')

        if sections['tasks']:
            lines.append('TASKS')
            for t in sections['tasks']:
                lines.append(f'  - {t.title}: due {t.dueDate}')
            lines.append('')

        if sections['scholarships']:
            lines.append('SCHOLARSHIPS')
            for s in sections['scholarships']:
                lines.append(f'  - {s.name}: deadline {s.deadline}')
            lines.append('')

        if sections['conferences']:
            lines.append('CONFERENCES')
            for c in sections['conferences']:
                lines.append(f'  - {c.name}: deadline {c.deadline}')
            lines.append('')

        lines.append('Open MasterTrack to see the full picture.')
        return '\n'.join(lines)
