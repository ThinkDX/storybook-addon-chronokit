import type { Meta, StoryObj } from '@storybook/react-vite'
import { CountdownComplex } from './CountdownComplex'

// Fixed base time for stable stories
const BASE_TIME = new Date('2025-01-15T12:00:00').getTime()

const meta = {
  title: 'Components/CountdownComplex',
  component: CountdownComplex,
  parameters: {
    layout: 'centered',
    date: {
      now: BASE_TIME,
      canProgress: true,
    },
  },
  argTypes: {
    datetime: {
      control: 'date',
      description: 'Target datetime as a timestamp (milliseconds)',
    },
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l', 'xl'],
      description: 'Text size',
    },
    color: {
      control: 'color',
      description: 'Text color',
    },
    className: {
      control: 'text',
      description: 'CSS class name',
    },
    lowestUnit: {
      control: 'select',
      options: ['years', 'months', 'days', 'hours', 'minutes', 'seconds'],
      description: 'The smallest unit to display',
    },
  },
} satisfies Meta<typeof CountdownComplex>

export default meta
type Story = StoryObj<typeof meta>

const minutesFromBase = (minutes: number) => BASE_TIME + minutes * 60 * 1000
const hoursFromBase = (hours: number) => BASE_TIME + hours * 60 * 60 * 1000
const daysFromBase = (days: number) => BASE_TIME + days * 24 * 60 * 60 * 1000

export const Default: Story = {
  args: {
    datetime: minutesFromBase(5),
  },
}

export const SmallSize: Story = {
  args: {
    datetime: minutesFromBase(10),
    size: 'xs',
  },
}

export const LargeSize: Story = {
  args: {
    datetime: hoursFromBase(2),
    size: 'xl',
  },
}

export const WithColor: Story = {
  args: {
    datetime: minutesFromBase(30),
    size: 'l',
    color: '#3b82f6',
  },
}

export const LongCountdown: Story = {
  args: {
    datetime: daysFromBase(45),
    size: 'm',
  },
}

export const WithThresholds: Story = {
  args: {
    datetime: minutesFromBase(2),
    size: 'm',
    color: 'green',
    thresholdProps: {
      warning: {
        threshold: 120,
        size: 'l',
        color: 'orange',
      },
      critical: {
        threshold: 30,
        size: 'xl',
        color: 'red',
      },
    },
  },
}

export const ExpiredCountdown: Story = {
  args: {
    datetime: BASE_TIME - 1000, // 1 second ago
  },
}

export const AllSizes: Story = {
  args: {
    datetime: minutesFromBase(5),
  },
  render: (args) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <CountdownComplex datetime={args.datetime} size="xs" />
        <CountdownComplex datetime={args.datetime} size="s" />
        <CountdownComplex datetime={args.datetime} size="m" />
        <CountdownComplex datetime={args.datetime} size="l" />
        <CountdownComplex datetime={args.datetime} size="xl" />
      </div>
    )
  },
}

export const Frozen: Story = {
  parameters: {
    date: {
      now: BASE_TIME,
      canProgress: false,
    },
  },
  args: {
    datetime: minutesFromBase(5),
  },
}

export const FastForward: Story = {
  parameters: {
    date: {
      now: BASE_TIME,
      canProgress: true,
      clockSpeed: 20,
    },
  },
  args: {
    datetime: minutesFromBase(5),
    thresholdProps: {
      warning: {
        threshold: 180,
        size: 'l',
        color: 'orange',
      },
      critical: {
        threshold: 60,
        size: 'xl',
        color: 'red',
      },
    },
  },
}

export const MinutesOnly: Story = {
  args: {
    datetime: hoursFromBase(2) + minutesFromBase(45) - BASE_TIME, // 2h 45m
    lowestUnit: 'minutes',
    size: 'l',
  },
}

export const HoursOnly: Story = {
  args: {
    datetime: daysFromBase(3), // 3 days
    lowestUnit: 'hours',
    size: 'l',
  },
}

export const DaysOnly: Story = {
  args: {
    datetime: daysFromBase(45), // 45 days
    lowestUnit: 'days',
    size: 'l',
  },
}
