import { ActivityType, NotificationType } from '@/types/data'
import avatar1 from '@/assets/images/products/i1.jpg'
import avatar3 from '@/assets/images/users/avatar-3.jpg'
import avatar5 from '@/assets/images/users/avatar-5.jpg'
import avatar6 from '@/assets/images/users/avatar-6.jpg'
import avatar7 from '@/assets/images/users/avatar-7.jpg'
import smImg3 from '@/assets/images/small/img-3.jpg'
import smImg4 from '@/assets/images/small/img-4.jpg'
import smImg6 from '@/assets/images/small/img-6.jpg'
import { addOrSubtractDaysFromDate } from '@/utils/date'

export const notificationsData: NotificationType[] = [
  {
    from: 'Shabu Khichadi',
    content: 'Fresh Shabhu Khichadi with a mild spicy flavor is ready to serve. 🌶️🍲',
    icon: avatar1,
  },
]

export const activityStreamData: ActivityType[] = [
  {
    title: 'Report-Fix / Update',
    variant: 'danger',
    type: 'tasks',
    files: [
      {
        name: 'Concept.fig',
      },
      {
        name: 'larkon.docs',
      },
    ],
    time: addOrSubtractDaysFromDate(0),
  },
  {
    title: 'Project Status',
    files: [
      {
        name: 'UI/UX Figma Design.fig',
      },
    ],
    variant: 'success',
    type: 'design',
    status: 'completed',
    time: addOrSubtractDaysFromDate(1),
  },
  {
    title: 'Larkon Application UI v2.0.0',
    variant: 'primary',
    content: 'Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.',
    files: [{ name: 'Backup.zip' }],
    status: 'latest',
    time: addOrSubtractDaysFromDate(3),
  },
  {
    title: 'Alex Smith Attached Photos',
    icon: avatar7,
    time: addOrSubtractDaysFromDate(4),
    files: [{ preview: smImg6 }, { preview: smImg3 }, { preview: smImg4 }],
  },
  {
    title: 'Rebecca J. added a new team member',
    icon: avatar6,
    time: addOrSubtractDaysFromDate(4),
    content: 'Added a new member to Front Dashboard',
  },
  {
    title: 'Achievements',
    variant: 'warning',
    type: 'achievement',
    time: addOrSubtractDaysFromDate(5),
    content: 'Earned a "Best Product Award"',
  },
]
