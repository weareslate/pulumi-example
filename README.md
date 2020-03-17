## How to get off the floor and running with Pulumi

```
  $ brew install pulumi
  $ pulumi version
```

```
  $ brew upgrade pulumi
```

Next configure your AWS CLI

```
  $ aws configure
```

Create a dir and add Pulumi

```
  $ mkdir infra && cd infra
  $ pulumi new aws-javascript
```

```
  $ pulumi up
```

```
  $ pulumi destroy
```

Fix broken states, export the stack and then in the `temp.json` file remove resources objects from the pending_operation block. Then re-import and destroy

```
  $ pulumi stack export > temp.json
  $ pulumi stack import --file temp.json
  $ pulumi destroy
```
