import * as React from "react"
import Seo from "../components/seo"

const NotFoundPage = () => 
  React.createElement('main', { style: { textAlign: 'center', padding: '50px', color: 'white', background: 'black', height: '100vh' }},
    React.createElement('h1', null, "404: Not Found"),
    React.createElement('p', null, "You just hit a route that doesn't exist... the sadness."),
    React.createElement('a', { href: '/', style: { color: '#77aaff' }}, "Return to Solar System")
  )

export const Head = () => <Seo title="404: Not Found" />

export default NotFoundPage
