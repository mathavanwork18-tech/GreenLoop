import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { activityApi } from '../../services/activity/activity.api'
import ActivityHeader from './components/ActivityHeader/ActivityHeader'
import CoinRedemptionPanel from './components/Wallet/CoinRedemptionPanel'
import DailyMissions from './components/DailyMissions/DailyMissions'
import PickupTracker from './components/PickupTracker/PickupTracker'
import CertificatesGallery from './components/CertificatesGallery/CertificatesGallery'
import CoinHistory from './components/Wallet/CoinHistory'
import RecentActivityFeed from './components/RecentActivity/RecentActivityFeed'
import Modal from '../../components/ui/Modal'
import Icon from '../../components/Icon'
import type { DailyMission, CoinTransaction, RecyclingCertificate, ActivityFeedItem } from '../../types/activity.types'

export default function ActivityPage() {
  const { user, updateCoins, redeemCoins } = useAuth()

  const [missions, setMissions] = useState<DailyMission[]>([])
  const [transactions, setTransactions] = useState<CoinTransaction[]>([])
  const [certificates, setCertificates] = useState<RecyclingCertificate[]>([])
  const [activityList, setActivityList] = useState<ActivityFeedItem[]>([])

  const [pickupStep, setPickupStep] = useState(4)
  const [selectedCert, setSelectedCert] = useState<RecyclingCertificate | null>(null)
  const [showTipModal, setShowTipModal] = useState(false)
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      const [m, t, c, a] = await Promise.all([
        activityApi.getMissions(),
        activityApi.getCoinTransactions(),
        activityApi.getCertificates(),
        activityApi.getActivityStream(),
      ])
      if (isMounted) {
        setMissions(m)
        setTransactions(t)
        setCertificates(c)
        setActivityList(a)
      }
    }
    void fetchData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleClaimMission = (id: string, reward: number, title: string) => {
    setMissions(prev => prev.map(m => (m.id === id ? { ...m, completed: true } : m)))
    updateCoins(reward)
    activityApi.recordCoinTransaction({
      amount: reward,
      title: `Completed Mission: ${title}`,
      type: 'earn'
    }).then(newTx => {
      setTransactions(prev => [newTx, ...prev])
    })
  }

  const handleRedeemCode = (code: string) => {
    let amount = 50
    const upper = code.toUpperCase()
    if (upper === 'ECO100') amount = 100
    if (upper === 'CLEAN250') amount = 250
    if (upper === 'GREEN500') amount = 500

    redeemCoins(amount, `Redeemed Voucher: ${upper}`)
    setRedeemSuccessMsg(`Successfully credited +${amount} Green Coins for "${upper}"!`)
    setTimeout(() => setRedeemSuccessMsg(null), 3500)

    activityApi.getCoinTransactions().then(setTransactions)
  }

  return (
    <div className="page-content" style={{ paddingBottom: 'calc(var(--nav-height) + 32px)' }}>
      {/* 1. Header with Coin Balance & Streak */}
      <ActivityHeader coins={user?.greenCoins} streak={user?.streak} />

      <div className="container" style={{ paddingTop: 14 }}>
        {/* 2. Instant Coin Redemption Box */}
        <CoinRedemptionPanel onRedeem={handleRedeemCode} successMessage={redeemSuccessMsg} />

        {/* 3. Daily Missions */}
        <div style={{ marginTop: 20 }}>
          <DailyMissions
            missions={missions}
            onClaim={handleClaimMission}
            onOpenTip={() => setShowTipModal(true)}
          />
        </div>

        {/* 4. Live Custody Tracker */}
        <PickupTracker currentStep={pickupStep} onStepChange={setPickupStep} />

        {/* 5. Verified Recycling Certificates */}
        <CertificatesGallery
          certificates={certificates}
          onSelectCertificate={setSelectedCert}
        />

        {/* 6. Coin Transactions Ledger */}
        <CoinHistory
          transactions={transactions}
          onQuickRedeem={() => handleRedeemCode('ECO100')}
        />

        {/* 7. Recent Activity Stream */}
        <RecentActivityFeed activityList={activityList} />
      </div>

      {/* Certificate Detail Modal */}
      {selectedCert && (
        <Modal isOpen={!!selectedCert} onClose={() => setSelectedCert(null)} title="Official TNPCB Certificate">
          <div style={{ padding: '10px 0', textAlign: 'center' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}
            >
              <Icon name="certificate" size={32} color="var(--accent)" />
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 800 }}>
              {selectedCert.id}
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '4px 0 2px', color: 'var(--text-primary)' }}>
              {selectedCert.title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Device: <strong>{selectedCert.device}</strong> (S/N: {selectedCert.serialNo})
            </p>

            <div
              style={{
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                textAlign: 'left',
                fontSize: '0.78rem',
                lineHeight: 1.5,
                marginBottom: 16
              }}
            >
              <div><strong>Authorized Recycler:</strong> {selectedCert.recycler}</div>
              <div><strong>Issue Date:</strong> {selectedCert.date}</div>
              <div><strong>Materials Neutralized:</strong> {selectedCert.materialsRecovered}</div>
              <div><strong>Carbon Offset:</strong> {selectedCert.co2Saved}</div>
              <div><strong>Certified Compliance Officer:</strong> {selectedCert.verifier}</div>
            </div>

            <button onClick={() => setSelectedCert(null)} className="btn btn-primary btn-full">
              Close Certificate
            </button>
          </div>
        </Modal>
      )}

      {/* Eco Tip Modal */}
      <Modal isOpen={showTipModal} onClose={() => setShowTipModal(false)} title="Daily Eco Recycling Tip">
        <div style={{ padding: '8px 0' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
            💡 <strong>Lithium-Ion Safety:</strong> Always tape over exposed battery terminals with non-conductive electrical tape before dropping them off at a Green Loop recycling hub. This prevents accidental short circuits and ensures safe transit!
          </p>
          <button onClick={() => setShowTipModal(false)} className="btn btn-primary btn-full">
            Got It!
          </button>
        </div>
      </Modal>
    </div>
  )
}
