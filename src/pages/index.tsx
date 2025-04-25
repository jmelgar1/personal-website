import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import SolarSystem from "../components/entities/SolarSystem"
import "../styles/global.css"

const IndexPage: React.FC<PageProps> = () => {
  return React.createElement('main', null, 
    React.createElement(SolarSystem)
  )
}

export default IndexPage

export const Head: HeadFC = () => React.createElement('title', null, 'Josh Melgar | Website') 