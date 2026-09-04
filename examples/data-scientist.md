# Priya Raghunathan

**Location:** Toronto, Canada

**Email:** priya.raghunathan@example.com

**Phone:** +1 416 555 0142

**GitHub:** github.com/example

***

## OBJECTIVE

**Data Scientist** with 6 years turning messy operational data into decisions people actually act on. Strongest where modelling meets deployment: I ship models into production and stay responsible for them afterwards. Looking for a team that measures data science by outcomes rather than notebooks.

***

## PROJECT HIGHLIGHTS

### Churn Model That Changed the Retention Playbook

Retention spend was spread evenly across all at-risk accounts because nobody could rank them. Built a gradient-boosted churn model on **18 months** of billing and support data, calibrated so the score could be read as a probability rather than a rank. Shipped it behind an API the CRM calls nightly. Targeted campaigns on the top decile cut churn in that group by **19%** against a held-out control, on **~40k monthly accounts**.

### Forecast Backtesting Harness

Demand forecasts were evaluated by eyeballing charts, so nobody could say whether a change helped. Built a backtesting harness that replays any candidate model over historical windows and reports error by horizon and by segment. It caught a seasonal regression that had been live for **two quarters**, and made model changes an argument about numbers rather than opinion.

***

## WORK EXPERIENCE

### Meridian Retail Analytics

**Data Scientist** | Apr 2021 - Present

* Own the churn and demand-forecasting models end to end: **Python**, **scikit-learn**, **XGBoost**, **Airflow**.
* Serve models through a **FastAPI** service on **Kubernetes**, with drift monitoring and weekly retraining.
* Work directly with the retention team to design experiments and read the results honestly.
* Cut the forecasting pipeline runtime from **6 hours to 40 minutes** by rewriting joins in **DuckDB**.

### Northline Logistics

**Data Analyst, then Data Scientist** | Jul 2018 - Mar 2021

* Built the reporting layer in **dbt** and **BigQuery** that replaced a spreadsheet-based weekly pack.
* Developed a route-anomaly detector that flagged **~200 suspect trips/month** for review.
* Ran the A/B analysis for pricing changes across **12 regional markets**.

***

## SKILLS

### Modelling

*   **Languages:** Python, SQL, R.
*   **Libraries:** scikit-learn, XGBoost, statsmodels, pandas, Polars.
*   **Methods:** Causal inference and A/B testing, time-series forecasting, calibration, survival analysis.

### Engineering

*   **Pipelines:** Airflow, dbt, BigQuery, DuckDB, Spark.
*   **Deployment:** FastAPI, Docker, Kubernetes, MLflow, drift monitoring.
*   **Visualisation:** Plotly, Streamlit, Looker.

***

## EDUCATION

### University of Waterloo

**MMath Statistics** | 2016 - 2018

### University of Delhi

**BSc Mathematics** | 2013 - 2016
