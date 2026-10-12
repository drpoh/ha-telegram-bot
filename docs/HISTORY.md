# Home Assistant History and Statistics

## Purpose
Use Recorder/history/statistics to answer questions and discover patterns without overwhelming the LLM.

## Pipeline
HA history/statistics -> fetch -> normalize -> aggregate -> feature/fact extraction -> Context Builder.

Examples of derived facts:
- sauna heat-up duration
- usual device active duration
- repeated manual overrides
- typical time-of-day usage
- daily/weekly energy summaries

## Rules
- query the smallest useful entity/time range
- aggregate high-frequency sensors
- distinguish observed facts from inferred patterns
- retain timestamps and confidence
- current HA state takes precedence over historical expectation
