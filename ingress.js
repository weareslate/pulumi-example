const aws = require('@pulumi/aws');

const createIngress = (vpc, subnets) => {
  const albSecurityGroup = new aws.ec2.SecurityGroup(`alb-sg`, {
    vpcId: vpc.id,
    ingress: [
      {
        protocol: 'TCP',
        fromPort: 80,
        toPort: 80,
        cidrBlocks: ['0.0.0.0/0']
      }
    ]
  });

  const alb = new aws.lb.LoadBalancer('lb', {
    loadBalancerType: 'application',
    securityGroups: [albSecurityGroup.id],
    subnets: subnets.map(x => x.id)
  });

  const tg = new aws.lb.TargetGroup('lb-tg', {
    port: 80,
    protocol: 'HTTP',
    vpcId: vpc.id
  });

  const listener = new aws.lb.Listener('lb-listener', {
    defaultActions: [
      {
        targetGroupArn: tg.arn,
        type: 'forward'
      }
    ],
    loadBalancerArn: alb.arn,
    port: 80,
    protocol: 'HTTP'
  });
};

module.exports = createIngress;
