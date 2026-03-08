// src/pages/DashboardPage.jsx
import { useState } from 'react'
import Topbar           from '../components/layout/Topbar'
import OverallCard      from '../components/ui/OverallCard'
import StatRow          from '../components/ui/StatRow'
import RankCard         from '../components/ui/RankCard'
import SubjectTabs      from '../components/ui/SubjectTabs'
import SubjectDetailCard from '../components/ui/SubjectDetailCard'
import AllSubjectsList  from '../components/ui/AllSubjectsList'

export default function DashboardPage({ student, rank, onBack }) {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="dashboard-page">
      <Topbar student={student} onBack={onBack} />

      <div className="dashboard-body">

        {/* 1. Overall attendance big card */}
        <OverallCard student={student} />

        {/* 2. Quick stats row */}
        <StatRow student={student} />

        {/* 3. Rank card */}
        <RankCard rank={rank} />

        {/* 4. Subject tabs */}
        <SubjectTabs
          subjects={student.subjects}
          active={activeIdx}
          onChange={setActiveIdx}
        />

        {/* 5. Selected subject detail */}
        <SubjectDetailCard
          key={activeIdx}
          subject={student.subjects[activeIdx]}
          totalClasses={student.subjects[activeIdx].total_classes}
        />

        {/* 6. All subjects mini list */}
        <AllSubjectsList
          subjects={student.subjects}
          onSelect={i => { setActiveIdx(i); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        />

      </div>
    </div>
  )
}
