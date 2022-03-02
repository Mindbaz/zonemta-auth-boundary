# zonemta-auth-boundary

Authentication with Boundary (Hashicorp) for [ZoneMTA](https://github.com/zone-eu/zone-mta). Install this to performs SMTP authentication with [Boundary](https://www.boundaryproject.io/)

## Setup

Add this as a dependency for your ZoneMTA app

```
npm install zonemta-auth-boundary --save
```

Add a configuration entry in the "plugins" section of your ZoneMTA app

Example [here](./config.example.toml).

First enable plugin :

```toml
# auth-boundary.toml
["modules/zonemta-auth-boundary"]
enabled="receiver"
interfaces=["feeder"]
```

Then set boundary configuration for this plugin :

```toml
boundary_url="http://example.org:9200"
target_id="ttcp_1234567890"
```

## License

The GNU General Public License 3 ([details](https://www.gnu.org/licenses/quick-guide-gplv3.en.html))
