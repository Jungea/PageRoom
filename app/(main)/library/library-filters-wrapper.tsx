'use client'

import { useState } from 'react'
import { LibraryFilters } from '@/components/library-filters'
import { ContentCard } from '@/components/content-card'
import type { ContentWithRecord, ReadingStatus, ContentType } from '@/lib/types'

interface Props {
  contents: ContentWithRecord[]
}

export function LibraryFiltersWrapper({ contents }: Props) {
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | null>(null)
  const [selectedType, setSelectedType] = useState<ContentType | null>(null)

  const filtered = contents.filter((c) => {
    const statusMatch = !selectedStatus || c.reading_record?.status === selectedStatus
    const typeMatch = !selectedType || c.type === selectedType
    return statusMatch && typeMatch
  })

  return (
    <div className="space-y-4">
      <LibraryFilters
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        onStatusChange={setSelectedStatus}
        onTypeChange={setSelectedType}
      />
      {filtered.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: 'rgb(var(--color-text-muted))' }}>
          콘텐츠가 없어요.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => <ContentCard key={c.id} content={c} />)}
        </div>
      )}
    </div>
  )
}
