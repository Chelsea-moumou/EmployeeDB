# Novel-Aggregation-Service
Novel Aggregation Service with Configurable Crawler and Search Interface <br>
Need: Node.js, Express, MonogoDB<br>
Configure file: <br>
parsing rule: c -- children() <br>
              x -- text() <br>
              t -- trim() <br>
              a -- attr('href') <br>
              l -- attr('title') <br>
              number n -- eq(n)
