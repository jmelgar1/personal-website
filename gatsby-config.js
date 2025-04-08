/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `Josh Melgar's 3D Solar System`,
    description: `An interactive 3D solar system explorer featuring Earth and other planets.`,
    author: `@joshmelgar`,
    siteUrl: `https://yourdomain.com/`,
  },
  plugins: [
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Josh Melgar's 3D Solar System`,
        short_name: `Solar System`,
        start_url: `/`,
        background_color: `#000000`,
        theme_color: `#000000`,
        display: `fullscreen`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-typescript',
  ],
}
