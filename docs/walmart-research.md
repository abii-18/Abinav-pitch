# Walmart Data Engineer pitch research

Reviewed 7 October 2026. This is a qualitative sample, not a census of Walmart roles or a claim that every team uses the same stack. Live Careers pages below were readable at review; availability can change. Recent indexed official postings supplement the sample, with live availability unverified. Publication dates are not consistently provided, so no exact posting year is inferred. Senior roles inform overlapping engineering themes, not Abinav’s target title or eligibility. DE III is not assumed to be identical to DE2 across locations.

## Primary job-description sources

| Posting | Recurring engineering requirements in the posting |
| --- | --- |
| [Data Engineer III, R-2607604](https://careers.walmart.com/us/en/jobs/R-2607604) | Python/SQL, ETL, warehouse models including Redshift, query tuning, quality/reconciliation, dependencies and SLAs, monitoring, stakeholder requirements; also CI/CD and infrastructure automation. |
| [Senior Data Engineer, R-2642680](https://careers.walmart.com/us/en/jobs/R-2642680) | Python/SQL, Spark/PySpark, scalable ETL, Airflow, cloud warehouses, analytical models, query performance, quality and stakeholder delivery. |
| [Senior Data Engineer, R-2618683](https://careers.walmart.com/us/en/jobs/R-2618683) | SQL, cloud warehouses, batch/stream integration, modeling, reliable reporting, metric governance, troubleshooting and business collaboration. |
| [Senior Data Engineer, R-2595942, Walmart/VIZIO](https://careers.walmart.com/us/en/jobs/R-2595942) | Python/SQL, Spark/PySpark/Spark SQL, Airflow, cloud lakes, ETL, modeling, quality and performance; team-specific infrastructure and AI preferences are not universal requirements. |
| [Data Engineer III, R-2511162, Bangalore](https://walmart.wd504.myworkdayjobs.com/WalmartExternal/job/IN-KA-BANGALORE-Home-Office-Building-11/DATA-ENGINEER-III_R-2511162) | Indexed official description: Python, Spark, Airflow, GCP, ETL/modeling, quality, Kafka/Structured Streaming and Git/CI/CD. Live Workday body was unavailable; supplementary evidence only. |
| [Staff Data Engineer, R-2616473](https://careers.walmart.com/us/en/jobs/R-2616473) | Indexed official description: shared platforms, cross-team technical influence, mentoring and very large AdTech event processing. Live page unavailable; scope comparator only, excluded from frequency sample. |

## Requirement synthesis

High-frequency overlap across the four readable DE/ Senior descriptions: SQL, pipelines/integration, cloud data platforms, warehouse/data models, quality, performance and business/stakeholder requirements. Python recurs in three; Spark/PySpark in two. Those are strong engineering-focused themes, but not universal across analytics-oriented teams.

Secondary or team-dependent: Airflow (two of four, also the indexed Bangalore role), streaming/Kafka, a particular cloud provider, Git/CI/CD, infrastructure tooling and governance duties. GCP appears prominently in Spark-focused roles, while AWS/Azure and Redshift/Snowflake appear in others. AWS experience is relevant overlap, not evidence of GCP fluency. Spark SQL is narrower than the general Spark theme; optimizer/internals depth is primarily an interview preparation signal in this sample, not a defensible candidate claim.

Senior/staff scope to avoid: organization-wide platform strategy, multi-team architectural authority, mentoring scope, shared multi-tenant frameworks and responsibility for billion-event systems. Spark or Kafka itself is not staff-only. Individual roles have different experience minimums and location requirements; this pitch is not an assertion of eligibility for every sampled job.

## First-person interview accounts

- [D Santhosh Kumar — Walmart Bangalore DE III](https://www.linkedin.com/posts/santhosh-kumard_interview-experience-at-walmart-bangalore-activity-7307994385617432576-pFtb): describes Python problem solving, SQL windows, Spark internals, query optimization, warehouse design/debugging, project discussion and behavioral questions.
- [Abhay Singh — Walmart Senior Data Engineer](https://www.linkedin.com/posts/abhay4079_walmart-interview-experience-activity-7241297430875426817-MGRR): describes SQL/DSA, Spark optimization, Kafka and system design, plus project/manager discussions. Senior scope is not generalized to DE2.

These recent first-person accounts are anecdotal, not official hiring rubrics or guarantees of interview rounds. They corroborate SQL, practical project explanation and Spark preparation. Relative publication labels do not establish precise dates.

## Used in the pitch

Production Python/SQL, Glue/S3/Redshift and Airflow; incremental batch loads; 5M+ financial records daily and 99.9% pipeline success; 150+ daily runs; automated validation (25% fewer recurring issues); warehouse optimization (40% faster queries, COPY 3× versus row inserts); CloudWatch, controlled recovery and offshore L3 support since June 2026. The internship is separate from employment beginning January 2024.

Personal Retail Sales Lakehouse: 500K+ records/six PostgreSQL entities, API ingestion, Airflow/six parallel Bronze jobs, PySpark Silver transformations, partitioned Parquet, watermarks, idempotency, rejects, Snowflake staging/loading and dbt dimensions/facts/tests. User clarification adds hands-on production PySpark at BMO; the personal project supplies deeper independent techniques. Snowflake/dbt remain explicitly personal-project experience. Experience tags use clean names; they do not imply production use. The resume reference retains Docker’s internship scope and Git’s listed-skill scope. Data Engineer is public portfolio positioning; the official employment title remains recorded in the resume reference. Certifications and verified contact links are retained; project href remains absent.

## Deliberately not claimed

Spark cluster architecture ownership, Spark SQL optimizer or internals expertise, GCP/Azure, Kafka/streaming, Databricks, Scala, Kubernetes, Terraform, ML/AI deployments, governance/compliance ownership, Walmart internal-system experience, people-management or staff-level leadership. No new cost, latency, uptime, team-size or SLA metrics. Financial record volume is not recast as retail volume; personal-project volume is not production scale. Source of truth: `src/content/resume-reference.md`.
