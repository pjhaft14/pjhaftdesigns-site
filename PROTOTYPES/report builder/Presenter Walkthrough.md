# Report Builder Prototype — Presenter Walkthrough

Press **Shift+H** anywhere in the prototype to show or hide the built-in walkthrough helper. Press **Escape** to close it.

## Main demonstration

1. Open `report-builder.html` in Chrome.
2. Press **Ctrl+R** to reset the prototype.
3. Select **Create with SugarAI**.
4. Say: “Instead of configuring every report field manually, I’ll describe the result I need.”
5. Enter:

   > Show me open opportunities closing this quarter, grouped by sales stage.

6. When SugarAI shows similar reports, say: “Before creating something new, SugarAI checks whether an existing report may already meet the need.”
7. Select **Create a new report** to continue with the demonstration.
8. In **Review before building**, point out:

   - The Opportunities data source
   - The report type
   - The dynamic quarter and date range
   - The open-opportunity filter
   - The sales-stage grouping
   - The AI assumptions

9. Open the grouping selector and choose **Sales rep**. Explain that the AI-generated setup remains editable.
10. Change the grouping back to **Sales stage**.
11. Select **Build report**.
12. On the results screen, point out:

    - Summary metrics
    - The chart grouped by sales stage
    - Matching opportunity rows
    - Expandable and collapsible groups

13. In the refinement field, enter:

    > Only show opportunities over $250K.

14. Review the proposed changes and select **Apply**. Point out that the totals, chart, and rows update together.
15. Select **Undo** to demonstrate that users can safely reverse an AI refinement.
16. Apply the refinement again if desired, then select **Save**.
17. Close with: “The prototype uses realistic mock opportunity data. The filters, calculations, grouping, charts, and rows respond dynamically, while the natural-language interpretation is simulated for a controlled demonstration.”

## Optional alternate prompts

- `Show me at-risk opportunities by sales rep.`
- `Show win rate by sales rep this year.`
- `Show the top open opportunities by region.`
- `List open opportunities over $150K with no grouping.`

## Presenter reminder

If the prototype was already open before an update, press **Ctrl+R** before starting the walkthrough.
