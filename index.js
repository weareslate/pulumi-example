const aws = require("@pulumi/aws");
const createIngress = require("./ingress");
const createInstance = require("./instances");

const namespace = "aaas";

const environmentName = `${namespace}-dev`;
const awsRegion = process.env.AWS_REGION || "us-east-1";

const vpc = new aws.ec2.Vpc(`${namespace}-vpc`, {
  tags: {
    Name: `${environmentName}-vpc`
  },
  cidrBlock: "10.0.0.0/16"
});

const igw = new aws.ec2.InternetGateway("igw", {
  tags: {
    Name: "main"
  },
  vpcId: vpc.id
});

const routeTable = new aws.ec2.RouteTable("rt", {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: "0.0.0.0/0",
      gatewayId: igw.id
    }
  ],
  tags: {
    Name: `${namespace}-vpc-route-table`
  }
});

const subnets = [
  new aws.ec2.Subnet("default-a", {
    vpcId: vpc.id,
    cidrBlock: "10.0.0.0/17",
    availabilityZone: `${awsRegion}a`
  }),
  new aws.ec2.Subnet("default-b", {
    vpcId: vpc.id,
    cidrBlock: "10.0.128.0/17",
    availabilityZone: `${awsRegion}b`
  })
];

createIngress(vpc, subnets);

const sg = new aws.ec2.SecurityGroup("ec2-sg", {
  vpcId: vpc.id,
  ingress: [
    {
      protocol: "TCP",
      fromPort: 5000,
      toPort: 5001,
      cidrBlocks: ["0.0.0.0/0"]
    },
    {
      protocol: "TCP",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ["0.0.0.0/0"]
    }
  ],
  egress: [
    {
      fromPort: 0,
      toPort: 0,
      protocol: "-1",
      cidr_blocks: ["0.0.0.0/0"]
    }
  ]
});

subnets.map(({ id }, index) => {
  new aws.ec2.RouteTableAssociation(`${namespace}-rta-${index}`, {
    subnetId: id,
    routeTableId: routeTable.id
  });
  createInstance(`${namespace}-node-${index}`, id, sg.id);
});
