export type University = {
  id: string
  name: string
  country: string
  city: string
  type: 'Public' | 'Private' | 'Research' | 'Other'
  website: string
  description: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type Program = {
  id: string
  universityId: string
  name: string
  degree: string
  specialization: string
  duration: string
  language: string
  website: string
  description: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type Application = {
  id: string
  programId: string
  universityId: string
  opensDate?: string
  status:
    | 'Researching'
    | 'Interested'
    | 'Eligibility Check'
    | 'Preparing'
    | 'Application Started'
    | 'Ready to Submit'
    | 'Submitted'
    | 'Under Review'
    | 'Interview'
    | 'Accepted'
    | 'Rejected'
    | 'Waitlisted'
    | 'Withdrawn'
  priority: 'Dream' | 'Target' | 'Safe' | 'Backup'
  deadline: string
  funding: 'Fully Funded' | 'Partial' | 'Self-Funded' | 'Unknown'
  progress: number
  notes: string
  createdAt: string
  updatedAt: string
}

export type Task = {
  id: string
  title: string
  description: string
  applicationId?: string
  universityId?: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  status: 'todo' | 'in_progress' | 'done'
  category:
    | 'Research'
    | 'Documents'
    | 'SOP'
    | 'Recommendation'
    | 'Application'
    | 'Scholarship'
    | 'Visa'
    | 'Other'
  createdAt: string
}

export type Document = {
  id: string
  name: string
  category:
    | 'Academic'
    | 'Identity'
    | 'English Test'
    | 'Certifications'
    | 'Experience'
    | 'Application'
    | 'Scholarship'
    | 'Other'
  fileUrl: string
  expiryDate?: string
  description: string
  tags: string
  createdAt: string
}

export type ResearchPaper = {
  title: string
  link: string
  year: string
  notes: string
}

export type Professor = {
  id: string
  universityId: string
  programId?: string
  name: string
  title: string
  department: string
  email: string
  profileUrl: string
  labName: string
  labUrl: string
  researchAreas: string
  papers: ResearchPaper[]
  fitNotes: string
  contactStatus:
    | 'Not Contacted'
    | 'Researching'
    | 'Drafting Email'
    | 'Emailed'
    | 'Replied'
    | 'No Response'
    | 'Meeting Scheduled'
    | 'Not Pursuing'
  priority: 'High' | 'Medium' | 'Low'
  lastContactedDate: string
  createdAt: string
  updatedAt: string
}

export type Note = {
  id: string
  title: string
  content: string
  category:
    | 'Admission'
    | 'Scholarship'
    | 'Funding'
    | 'Faculty'
    | 'Research'
    | 'Application'
    | 'Visa'
    | 'Personal'
    | 'Other'
  universityId?: string
  programId?: string
  applicationId?: string
  createdAt: string
  updatedAt: string
}
