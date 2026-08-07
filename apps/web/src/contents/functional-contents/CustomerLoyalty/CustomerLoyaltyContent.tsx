'use client';

import { Badge, Button, Group, Progress, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useCustomerLoyaltyMutations } from '@/hooks/CustomerLoyalty/useCustomerLoyaltyMutations';
import { useCustomerLoyaltyQuery } from '@/hooks/CustomerLoyalty/useCustomerLoyaltyQuery';

export function CustomerLoyaltyContent() {
  const loyaltyQuery = useCustomerLoyaltyQuery();
  const mutations = useCustomerLoyaltyMutations();
  const loyalty = loyaltyQuery.data;

  return (
    <div>
      <div className="tt-page-header" style={{ background: 'var(--tt-black)' }}>
        <div className="tt-container">
          <p className="tt-eyebrow" style={{ marginBottom: 10 }}>Rewards</p>
          <h1 className="tt-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', marginBottom: 10 }}>
            Loyalty quests
          </h1>
          <p className="tt-body" style={{ maxWidth: 560 }}>
            Earn points from simple snack goals. Rewards are tracked by the backend ledger.
          </p>
          <span className="tt-badge-gold" style={{ padding: '4px 12px', borderRadius: 20, marginTop: 12, display: 'inline-block' }}>
            {loyalty ? `${loyalty.pointsBalance} points` : 'Points'}
          </span>
        </div>
      </div>

      <div className="tt-container" style={{ paddingBlock: '32px 56px' }}>
        <Stack gap="xl">
          {loyaltyQuery.isLoading ? (
            <div className="tt-state-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid var(--tt-gold-muted)', borderTopColor: 'var(--tt-gold)', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
              <h3 className="tt-editorial" style={{ fontSize: '1.05rem' }}>Loading rewards...</h3>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : loyaltyQuery.isError || !loyalty ? (
            <div className="tt-state-card" style={{ padding: 32, textAlign: 'center' }}>
              <h3 className="tt-editorial" style={{ fontSize: '1.05rem', marginBottom: 6 }}>Rewards unavailable</h3>
              <p className="tt-body" style={{ fontSize: '0.85rem' }}>Sign in again, then try rewards.</p>
            </div>
          ) : (
            <>
              <div className="tt-panel-elevated" style={{ padding: 24, borderRadius: 16 }}>
                <Group justify="space-between">
                  <div>
                    <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>Point balance</Text>
                    <Title order={2} style={{ color: 'var(--tt-gold-light)', fontFamily: 'var(--tt-font-editorial)' }}>{loyalty.pointsBalance}</Title>
                  </div>
                  <Badge styles={{ root: { background: 'rgba(184, 147, 62, 0.1)', color: 'var(--tt-gold-light)', border: '1px solid var(--tt-gold-muted)' } }}>Ledger backed</Badge>
                </Group>
              </div>

              <SimpleGrid cols={{ base: 1, md: 2 }}>
                {loyalty.quests.map((quest) => (
                  <div key={quest.id} className="tt-panel" style={{ padding: 20, borderRadius: 16 }}>
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text fw={850} style={{ color: 'var(--tt-cream)' }}>{quest.name}</Text>
                        <Badge styles={{ root: { background: quest.completed ? 'rgba(34,197,94,0.12)' : 'rgba(184,147,62,0.1)', color: quest.completed ? '#4ade80' : 'var(--tt-gold-light)', border: `1px solid ${quest.completed ? 'rgba(34,197,94,0.2)' : 'var(--tt-gold-muted)'}` } }}>
                          {quest.completed ? 'Ready' : `${quest.rewardPoints} pts`}
                        </Badge>
                      </Group>
                      <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>{quest.description ?? 'Complete the quest to earn points.'}</Text>
                      <Progress value={Math.min(100, (quest.progress / quest.goalTarget) * 100)} color="yellow" styles={{ root: { background: 'var(--tt-surface)' } }} />
                      <Text size="xs" style={{ color: 'var(--tt-cream-dim)' }}>{quest.progress} of {quest.goalTarget}</Text>
                      <Button
                        disabled={!quest.completed || quest.rewardClaimed}
                        loading={mutations.claimMutation.isPending}
                        onClick={() => mutations.claimMutation.mutate(quest.id)}
                        styles={{ root: { background: !quest.completed || quest.rewardClaimed ? 'var(--tt-surface)' : 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))', border: 'none', color: 'var(--tt-cream)' } }}
                      >
                        {quest.rewardClaimed ? 'Claimed' : 'Claim Reward'}
                      </Button>
                    </Stack>
                  </div>
                ))}
              </SimpleGrid>
            </>
          )}
        </Stack>
      </div>
    </div>
  );
}
