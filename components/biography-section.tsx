import { Fragment } from "react"
import { SectionHeading } from "@/components/section-heading"

type QuickFact = {
  label: string
  value: string
}

type Biography = {
  intro: string
  summary: string
  quickFacts: QuickFact[]
}

type BiographySectionProps = {
  readonly num: number
  readonly data: Biography
}

export function BiographySection({ num, data }: BiographySectionProps) {
  return (
    <>
      <SectionHeading num={num} title="Biography" id="bio" />
      <dl className="facts">
        {data.quickFacts.map((fact) => (
          <Fragment key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </Fragment>
        ))}
      </dl>
      <p>{data.summary}</p>
    </>
  )
}
