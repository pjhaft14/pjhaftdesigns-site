# Report Builder Prototype Notes

The presentation-ready version of the demonstration steps is also saved in `Presenter Walkthrough.md`.

Keyboard help: press **Shift+H** in the prototype to show or hide the walkthrough helper.

## Kickoff prompt

> Show me open opportunities closing this quarter, grouped by sales stage.

Use this as the first question when demonstrating the AI experience. It triggers the interpretation, report setup, assumptions, review, and report-building flow.

## Presenter walkthrough

### Before the session

1. Open `report-builder.html` in Chrome.
2. Refresh the page so the prototype starts from the report list.
3. Select **Create with SugarAI**.

### Main flow

**Say:** “Instead of configuring a report field by field, I’ll describe the outcome I need.”

Enter:

> Show me open opportunities closing this quarter, grouped by sales stage.

When SugarAI shows similar reports, explain that it is checking for an existing report before creating a duplicate. Select **Create a new report** to continue the main demonstration.

**Point out:**

- SugarAI translates the request into a report configuration.
- The quarter label and date range are calculated from today.
- The review step exposes the data source, report type, grouping, filters, and assumptions before anything is built.

At **Review before building**:

1. Open the grouping selector and briefly choose **Sales rep** to show that the setup is editable.
2. Change it back to **Sales stage** for the main story.
3. Select **Build report**.

### Results

**Say:** “The chart, totals, and rows are calculated from the chosen filters and grouping—not swapped screenshots.”

Point out the KPI summary, grouped chart, and opportunity rows. Expand or collapse one sales-stage group.

### Refine the report

Enter:

> Only show opportunities over $250K.

Review the proposed change, then select **Apply**.

**Say:** “Refinement is previewed before it changes the report, and I can undo it if the result is not what I intended.”

Select **Undo** once to demonstrate recovery, then reapply the refinement if desired.

### Finish

Select **Save** and point out the saved status.

**Close with:** “This prototype uses realistic mock opportunity data. The interactions and calculations are dynamic, while the AI interpretation is simulated for a controlled demonstration.”

## Optional alternate prompts

- `Show me at-risk opportunities by sales rep.`
- `Show win rate by sales rep this year.`
- `Show the top open opportunities by region.`
- `List open opportunities over $150K with no grouping.`
