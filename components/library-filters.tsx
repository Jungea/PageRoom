'use client'

import { cn, getStatusLabel, getContentTypeLabel } from '@/lib/utils'
import type { ReadingStatus, ContentType } from '@/lib/types'

const STATUS_OPTIONS: ReadingStatus[] = [
  'reading', 'completed', 'to_read', 'dropped', 'rereading', 'waiting', 'up_to_date',
]

const TYPE_OPTIONS: ContentType[] = ['book', 'webnovel', 'indie', 'original']

interface LibraryFiltersProps {
  selectedStatus: ReadingStatus | null
  selectedType: ContentType | null
  onStatusChange: (status: ReadingStatus | null) => void
  onTypeChange: (type: ContentType | null) => void
}

export function LibraryFilters({
  selectedStatus,
  selectedType,
  onStatusChange,
  onTypeChange,
}: LibraryFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-xs font-medium" style={{ color: 'rgb(var(--color-text-muted))' }}>상태</p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="전체"
            active={selectedStatus === null && selectedType === null}
            onClick={() => { onStatusChange(null); onTypeChange(null) }}
          />
          {STATUS_OPTIONS.map((s) => (
            <FilterChip
              key={s}
              label={getStatusLabel(s)}
              active={selectedStatus === s}
              onClick={() => onStatusChange(selectedStatus === s ? null : s)}
            />
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-medium" style={{ color: 'rgb(var(--color-text-muted))' }}>타입</p>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((t) => (
            <FilterChip
              key={t}
              label={getContentTypeLabel(t)}
              active={selectedType === t}
              onClick={() => onTypeChange(selectedType === t ? null : t)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-sm font-medium transition-colors',
        active ? 'text-white' : 'border',
      )}
      style={
        active
          ? { backgroundColor: 'rgb(var(--color-primary))', color: 'rgb(var(--color-primary-foreground))' }
          : { borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-text-muted))' }
      }
    >
      {label}
    </button>
  )
}
