import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { ScanResultDetail } from '@/components/scan-result-detail'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state } = useApp()
  const scan = state.scans.find((s) => s.id === id)

  if (!scan) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-lg font-semibold">Scan not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This record may have been removed.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/app/history')}>
          <ArrowLeft className="h-4 w-4" /> Back to history
        </Button>
      </div>
    )
  }

  const user = state.currentUser
  const canDecide =
    !!user &&
    (user.role === 'officer' ? user.checkpointId === scan.checkpointId : user.role === 'admin')

  return <ScanResultDetail report={scan} canDecide={!!canDecide} />
}