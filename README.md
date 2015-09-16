# Novel-Aggregation-Service
Novel Aggregation Service with Configurable Crawler and Search Interface
Need: Node.js, Express, MonogoDB
Configure file:
parsing rule: c -- children()
              x -- text()
              t -- trim()
              a -- attr('href')
              l -- attr('title')
              number n -- eq(n)
