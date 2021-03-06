﻿using System;
using System.Collections.Generic;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Wordprocessing;
using System.Drawing;

namespace NotesFor.HtmlToOpenXml
{
	using TagsAtSameLevel = System.ArraySegment<DocumentFormat.OpenXml.OpenXmlElement>;

	sealed class TableStyleCollection : OpenXmlStyleCollection
	{
		private Dictionary<String, Stack<TagsAtSameLevel>> tagsParagraph;


		public TableStyleCollection()
		{
			tagsParagraph = new Dictionary<String, Stack<TagsAtSameLevel>>();
		}

		internal override void Reset()
		{
			this.tagsParagraph.Clear();
			base.Reset();
		}

		//____________________________________________________________________
		//

		/// <summary>
		/// Apply all the current Html tag to the specified table cell.
		/// </summary>
		public override void ApplyTags(OpenXmlCompositeElement tableCell)
		{
			if (tags.Count > 0)
			{
				TableCellProperties properties = tableCell.GetFirstChild<TableCellProperties>();
				if (properties == null) tableCell.PrependChild<TableCellProperties>(properties = new TableCellProperties());

				var en = tags.GetEnumerator();
				while (en.MoveNext())
				{
					TagsAtSameLevel tagsOfSameLevel = en.Current.Value.Peek();
					foreach (OpenXmlElement tag in tagsOfSameLevel.Array)
						properties.Append(tag.CloneNode(true));
				}
			}

			// Apply some style attributes on the unique Paragraph tag contained inside a table cell.
			if (tagsParagraph.Count > 0)
			{
				Paragraph p = tableCell.GetFirstChild<Paragraph>();
				ParagraphProperties properties = p.GetFirstChild<ParagraphProperties>();
				if (properties == null) p.PrependChild<ParagraphProperties>(properties = new ParagraphProperties());

				var en = tagsParagraph.GetEnumerator();
				while (en.MoveNext())
				{
					TagsAtSameLevel tagsOfSameLevel = en.Current.Value.Peek();
					foreach (OpenXmlElement tag in tagsOfSameLevel.Array)
						properties.Append(tag.CloneNode(true));
				}
			}
		}

		public void BeginTagForParagraph(string name, params OpenXmlElement[] elements)
		{
			Stack<TagsAtSameLevel> enqueuedTags;
			if (!tagsParagraph.TryGetValue(name, out enqueuedTags))
			{
				tagsParagraph.Add(name, enqueuedTags = new Stack<TagsAtSameLevel>());
			}

			enqueuedTags.Push(new TagsAtSameLevel(elements));
		}

		public void EndTagForParagraph(string name)
		{
			Stack<TagsAtSameLevel> enqueuedTags;
			if (tagsParagraph.TryGetValue(name, out enqueuedTags))
			{
				enqueuedTags.Pop();
				if (enqueuedTags.Count == 0) tagsParagraph.Remove(name);
			}
		}

		/// <summary>
		/// Move inside the current tag related to table (td, thead, tr, ...) and converts some common
		/// attributes to their OpenXml equivalence.
		/// </summary>
		/// <param name="styleAttributes">The collection of attributes where to store new discovered attributes.</param>
		public void ProcessCommonAttributes(HtmlEnumerator en, IList<OpenXmlElement> styleAttributes)
		{
			var colorValue = en.StyleAttributes.GetAsColor("background-color");
			if (colorValue.IsEmpty) colorValue = en.Attributes.GetAsColor("bgcolor");
			if (!colorValue.IsEmpty)
			{
				styleAttributes.Add(
					new Shading() { Val = ShadingPatternValues.Clear, Color = "auto", Fill = colorValue.ToHexString() });
			}

			var htmlAlign = en.StyleAttributes["vertical-align"];
			if (htmlAlign == null) htmlAlign = en.Attributes["valign"];
			if (htmlAlign != null)
			{
				TableVerticalAlignmentValues? valign = ConverterUtility.FormatVAlign(htmlAlign);
				if (valign.HasValue)
					styleAttributes.Add(new TableCellVerticalAlignment() { Val = valign });
			}

			htmlAlign = en.StyleAttributes["text-align"];
			if (htmlAlign == null) htmlAlign = en.Attributes["align"];
			if (htmlAlign != null)
			{
				JustificationValues? halign = ConverterUtility.FormatParagraphAlign(htmlAlign);
				if (halign.HasValue)
					this.BeginTagForParagraph(en.CurrentTag, new KeepNext(), new Justification { Val = halign });
			}
		}
	}
}
