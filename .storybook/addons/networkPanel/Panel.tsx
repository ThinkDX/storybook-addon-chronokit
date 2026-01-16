import React from 'react'
import { useAddonState, useChannel } from 'storybook/manager-api'
import { AddonPanel, Badge, Spaced } from 'storybook/internal/components'
import { styled } from 'storybook/theming'
import { ADDON_ID, EVENTS, type NetworkRequest } from './constants'

const Container = styled.div({
  padding: '12px',
  height: '100%',
  overflow: 'auto',
})

const RequestList = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

const RequestRow = styled.div<{ $hasError: boolean }>(({ theme, $hasError }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '4px',
  backgroundColor: $hasError ? theme.background.negative : theme.background.content,
  border: `1px solid ${$hasError ? theme.color.negative : theme.appBorderColor}`,
  fontSize: '13px',
  fontFamily: theme.typography.fonts.mono,
}))

const Method = styled.span<{ $method: string }>(({ theme, $method }) => {
  const colors: Record<string, string> = {
    GET: theme.color.secondary,
    POST: theme.color.positive,
    PUT: theme.color.warning,
    DELETE: theme.color.negative,
    PATCH: theme.color.gold,
  }
  return {
    fontWeight: 'bold',
    color: colors[$method] ?? theme.color.defaultText,
    minWidth: '60px',
  }
})

const Url = styled.span({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const Duration = styled.span(({ theme }) => ({
  color: theme.color.mediumdark,
  fontSize: '12px',
  minWidth: '60px',
  textAlign: 'right',
}))

const EmptyState = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  color: theme.color.mediumdark,
  fontSize: '14px',
  gap: '8px',
}))

const Header = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
  paddingBottom: '12px',
  borderBottom: `1px solid ${theme.appBorderColor}`,
}))

const Title = styled.h3(({ theme }) => ({
  margin: 0,
  fontSize: '14px',
  fontWeight: 'bold',
  color: theme.color.defaultText,
}))

const ClearButton = styled.button(({ theme }) => ({
  padding: '4px 8px',
  fontSize: '12px',
  borderRadius: '4px',
  border: `1px solid ${theme.appBorderColor}`,
  backgroundColor: theme.background.content,
  color: theme.color.defaultText,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.background.hoverable,
  },
}))

function getStatusBadge(request: NetworkRequest) {
  if (request.error) {
    return <Badge status="negative">Error</Badge>
  }
  if (request.status === null) {
    return <Badge status="neutral">Pending</Badge>
  }
  if (request.status >= 200 && request.status < 300) {
    return <Badge status="positive">{request.status}</Badge>
  }
  if (request.status >= 400) {
    return <Badge status="negative">{request.status}</Badge>
  }
  return <Badge status="warning">{request.status}</Badge>
}

function getMockedBadge(mocked: boolean) {
  if (mocked) {
    return <Badge status="positive">Mocked</Badge>
  }
  return <Badge status="warning">Unmocked</Badge>
}

interface NetworkPanelProps {
  active: boolean
}

export function NetworkPanel({ active }: NetworkPanelProps) {
  const [requests, setRequests] = useAddonState<NetworkRequest[]>(ADDON_ID, [])

  useChannel({
    [EVENTS.REQUEST]: (request: NetworkRequest) => {
      setRequests((prev) => [...prev, request])
    },
    [EVENTS.CLEAR]: () => {
      setRequests([])
    },
  })

  const unmockedCount = requests.filter((r) => !r.mocked).length
  const errorCount = requests.filter((r) => r.error || (r.status && r.status >= 400)).length

  return (
    <AddonPanel active={active}>
      <Container>
        <Header>
          <Title>
            <Spaced col={1}>
              <span>Network Requests</span>
              {requests.length > 0 && (
                <Badge status="neutral">{requests.length}</Badge>
              )}
              {unmockedCount > 0 && (
                <Badge status="warning">{unmockedCount} unmocked</Badge>
              )}
              {errorCount > 0 && (
                <Badge status="negative">{errorCount} failed</Badge>
              )}
            </Spaced>
          </Title>
          {requests.length > 0 && (
            <ClearButton onClick={() => setRequests([])}>Clear</ClearButton>
          )}
        </Header>

        {requests.length === 0 ? (
          <EmptyState>
            <span>No network requests captured</span>
            <span style={{ fontSize: '12px' }}>
              Requests will appear here when the story makes fetch calls
            </span>
          </EmptyState>
        ) : (
          <RequestList>
            {requests.map((request) => (
              <RequestRow
                key={request.id}
                $hasError={!!request.error || (request.status !== null && request.status >= 400)}
              >
                <Method $method={request.method}>{request.method}</Method>
                {getStatusBadge(request)}
                {getMockedBadge(request.mocked)}
                <Url title={request.url}>{request.url}</Url>
                <Duration>
                  {request.duration !== null ? `${request.duration}ms` : '...'}
                </Duration>
              </RequestRow>
            ))}
          </RequestList>
        )}
      </Container>
    </AddonPanel>
  )
}
