import type { Meta, StoryObj } from '@storybook/react-vite'
import { CountdownSimple } from './CountdownSimple'

// Fixed base time for stable stories
const BASE_TIME = new Date('2025-01-15T12:00:00').getTime()

const meta = {
  title: 'Components/CountdownSimple',
  component: CountdownSimple,
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
} satisfies Meta<typeof CountdownSimple>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    datetime: BASE_TIME + 5 * 60 * 1000, // 5 minutes
  },
}

export const SmallSize: Story = {
  args: {
    datetime: BASE_TIME + 10 * 60 * 1000, // 10 minutes
    size: 'xs',
  },
}

export const LargeSize: Story = {
  args: {
    datetime: BASE_TIME + 2 * 60 * 60 * 1000, // 2 hours
    size: 'xl',
  },
}

export const WithColor: Story = {
  args: {
    datetime: BASE_TIME + 30 * 60 * 1000, // 30 minutes
    size: 'l',
    color: '#3b82f6',
  },
}

export const LongCountdown: Story = {
  args: {
    datetime: BASE_TIME + 45 * 24 * 60 * 60 * 1000, // 45 days
    size: 'm',
  },
}

export const WithThresholds: Story = {
  args: {
    datetime: BASE_TIME + 2 * 60 * 1000, // 2 minutes
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
    datetime: BASE_TIME + 5 * 60 * 1000, // 5 minutes
  },
  render: (args) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <CountdownSimple datetime={args.datetime} size="xs" />
        <CountdownSimple datetime={args.datetime} size="s" />
        <CountdownSimple datetime={args.datetime} size="m" />
        <CountdownSimple datetime={args.datetime} size="l" />
        <CountdownSimple datetime={args.datetime} size="xl" />
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
    datetime: BASE_TIME + 5 * 60 * 1000, // 5 minutes
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
    datetime: BASE_TIME + 5 * 60 * 1000, // 5 minutes (completes in 30 real seconds)
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
    datetime: BASE_TIME + 2 * 60 * 60 * 1000 + 45 * 60 * 1000, // 2h 45m
    lowestUnit: 'minutes',
    size: 'l',
  },
}

export const HoursOnly: Story = {
  args: {
    datetime: BASE_TIME + 3 * 24 * 60 * 60 * 1000, // 3 days
    lowestUnit: 'hours',
    size: 'l',
  },
}

export const DaysOnly: Story = {
  args: {
    datetime: BASE_TIME + 45 * 24 * 60 * 60 * 1000, // 45 days
    lowestUnit: 'days',
    size: 'l',
  },
}
