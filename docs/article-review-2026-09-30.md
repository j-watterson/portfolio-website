# September 30, 2026 article review

Released two drafts from batch `batch_6abae322faa88190b95e32a320b7dabf` using the existing reviewed-publication command and immutable topic snapshot:

- Cardinality and participation constraints
- Database constraints versus validation queries

Read both full drafts. Checked the constraint claims and join/grouping behavior against the PostgreSQL 18 documentation, and pinned the articles' sources to that version:

- https://www.postgresql.org/docs/18/ddl-constraints.html
- https://www.postgresql.org/docs/18/queries-table-expressions.html

Removed the unused normalization citation from the cardinality article. Made the SQL dialect explicit and clarified the payment diagnostic's hypothetical scope. Retained the distinction between child-to-parent foreign keys and parent-to-child minimum participation, which needs an additional lifecycle or validation control.

Executed every SQL example in an isolated PGlite 0.5.8 runtime reporting PostgreSQL 18.3. For the cardinality article, loaded its fixture, confirmed the orphan query is empty and the missing-items query returns order 101, supplied the explicitly referenced staging table, and confirmed a duplicated profile is detected. Verified rejection of a null customer, a nonexistent customer, a duplicate profile, and an orphan profile (SQLSTATE 23502, 23503, and 23505).

For the constraints/validation article, created all six tables and supplied a hypothetical fixture with one paid order without lines, one captured-payment mismatch (900 versus 1000 cents), and one shipment predating its order. Confirmed all three exception types and the amounts. Confirmed rejection of an unknown product and zero quantity (23503 and 23514).

The reviewed input is archived in `generated/weekly/reviewed-2026-09-30.json`. The public copies receive the actual publication date from the publisher. Original batch results and historical batch counts remain intact; the other drafts retain their review holds.
