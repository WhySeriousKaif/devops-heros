# 05. Amazon DynamoDB and Amazon RDS — Database Services

## DynamoDB

Amazon DynamoDB is a serverless, fully managed NoSQL key-value and document database designed for low-latency access at scale.

### Data Model

- **Table:** a collection of items.
- **Item:** one record, similar to a row but without a fixed table-wide schema.
- **Attribute:** a named value within an item.
- **Partition key:** hashed to determine the physical partition that stores an item.
- **Sort key:** optional second key that orders related items sharing a partition key.
- **Primary key:** either a partition key alone or a partition key plus sort key.

Access patterns should be designed before keys and indexes. Poor partition-key selection can create hot partitions.

### Common Use Cases

- Shopping carts and user sessions.
- Gaming profiles and leaderboards.
- Device and IoT metadata.
- High-scale APIs and event-driven applications.
- Metadata catalogs and serverless applications.

## Amazon RDS

Amazon Relational Database Service (RDS) manages relational database infrastructure, including common provisioning, patching, backup, and recovery tasks.

### Supported Engine Families

RDS supports Amazon Aurora as well as managed editions of PostgreSQL, MySQL, MariaDB, Oracle Database, Microsoft SQL Server, and IBM Db2. Availability and features vary by Region and engine version.

### Core Concepts

- **DB instance:** isolated database compute and memory capacity.
- **DB storage:** managed block storage configured for capacity and performance requirements.
- **Security:** place databases in private subnets, restrict security groups, encrypt storage, use TLS, and manage credentials securely.
- **Automated backups:** point-in-time recovery within the configured retention window.
- **Snapshot:** a user-controlled backup retained until deleted.
- **Multi-AZ:** maintains a synchronous standby or cluster topology for high availability and failover.
- **Read replica:** an asynchronously replicated copy used mainly for read scaling and some disaster-recovery patterns.

Multi-AZ improves availability; it is not the same as a read replica. The standby in a traditional Multi-AZ deployment is not used to serve read traffic.

### Common Use Cases

- Transactional business applications.
- Systems requiring SQL, joins, and relational constraints.
- Content management and e-commerce platforms.
- Enterprise applications using commercial database engines.
- Reporting workloads using read replicas.

## Choosing Between Them

| Requirement | DynamoDB | RDS |
|---|---|---|
| Data model | Key-value/document | Relational tables |
| Query style | Known access patterns | Flexible SQL queries and joins |
| Scaling | Serverless horizontal scaling | Instance/storage scaling and replicas |
| Transactions | Supported, with NoSQL modeling | Core relational strength |
| Best fit | Massive scale and predictable access | Relational integrity and SQL ecosystem |

Choose from workload access patterns, consistency, relationships, operational requirements, and cost—not from popularity alone.

## References

- [Core components of DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html)
- [What is Amazon RDS?](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/)
- [RDS Multi-AZ deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html)
- [RDS read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html)
