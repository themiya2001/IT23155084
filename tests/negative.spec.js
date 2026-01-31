const { test, expect } = require('@playwright/test');

async function enterSinglish(page, text) {
  const singlishBox = page.getByRole('textbox', { name: /Singlish/i });
  if (await singlishBox.count() > 0) {
    await singlishBox.first().fill('');
    await singlishBox.first().fill(text);
    return;
  }

  const ta = page.locator('textarea');
  if (await ta.count() > 0) {
    await ta.first().fill('');
    await ta.first().fill(text);
    return;
  }

  const ce = page.locator('[contenteditable="true"]');
  if (await ce.count() > 0) {
    await ce.first().click();
    await page.keyboard.insertText(text);
    return;
  }

  const input = page.locator('input[type="text"], input');
  if (await input.count() > 0) {
    await input.first().fill('');
    await input.first().fill(text);
    return;
  }

  throw new Error('Singlish input field not found.');
}

// Negative scenarios
const scenarios = [
  { id: 'Neg_Fun_0001', name: 'Ambiguous slang causing mistranslation', input: 'Eka machan aeththatama patta scene eka.', expected: 'එක මචන් ඇත්තටම පට්ට සීන් එක.' },
  { id: 'Neg_Fun_0002', name: 'Joined Singlish words not split correctly', input: 'mataoyaatabaninnahithenavaa.', expected: 'මට ඔයාට බනින්න හිතෙනවා.' },
  { id: 'Neg_Fun_0003', name: 'Excessive spacing affects translation', input: 'mata      oyaava    ooneema naee dhaen.', expected: 'මට ඔයාව ඕනේම නෑ දැන්.' },
  { id: 'Neg_Fun_0004', name: 'Roman diacritics not supported', input: 'Mama heta oyath ekka yanna hithan innē.', expected: 'මම හෙට ඔයත් එක්ක යන්න හිතන් ඉන්නේ.' },
  { id: 'Neg_Fun_0005', name: 'Mixed Singlish and English technical terms', input: 'Mama magee project ekata adhaalava API integration eka test karalaa report eka submit karanavaa.', expected: 'මම මගේ project එකට අදාලව API ඒකාබද්ධ කිරීම පරීක්ෂා කරලා report එක submit කරනවා.' },
  { id: 'Neg_Fun_0006', name: 'Excess punctuation causes confusion', input: 'Oyaa innavadha?? meeka haridha kiyalaa baeluvadha!!!?? mama kiyannē aththada kiyalaa baeluvadha?', expected: '28/01/2026 දිනයට කරන්න ඕනේ.' },
  { id: 'Neg_Fun_0007', name: 'Long paragraph partially translated', input: 'Mama gedhara giyaata passe amma mata kivvaa heta school yanna epaa kiyala. Ehema kivvath mama gedhara inna baeri nisaa maa yanna haedhuvaa. passe ammaa mata baennaa. passe aeyi mata baenne kiyalaa aesuvaama makivvaa paasalee godak Lamayita uNa haedhilaa kiyalaa', expected: 'මම ගෙදර ගියාට පස්සෙ අම්ම මට කිව්වා හෙට school යන්න එපා කියල. එහෙම කිව්වත් මම ගෙදර ඉන්න බැරි නිසා මා යන්න හැදුවා. පස්සෙ අම්මා මට බැන්නා. පස්සෙ ඇයි මට බැන්නෙ කියලා ඇසුවාම මකිව්වා පාසලේ ගොඩක් ළමයිට උණ හැදිලා කියලා.' },
  { id: 'Neg_Fun_0008', name: 'Currency without spacing translated incorrectly', input: 'Oyaa eyage badu tika Rs. 1500kin ganna epaa.', expected: 'ඔයා එයගෙ බඩු ටික රු.1500කින් ගන්න එපා.' },
  { id: 'Neg_Fun_0009', name: 'Negation scope translated incorrectly', input: 'Mama danne nee eyaa oyath ekka enavadha kiyalaa.', expected: 'මම දන්නෙ නැහැ එයා ඔයත් එක්ක එනවද කියලා.' },
  { id: 'Neg_Fun_0010', name: 'Incorrect handling of time and numbers', input: 'Mata 7.30 AM meeting ekak thiyenavaa office eken eliyee saha eeka 10.30 AM venakal thiyenavaa kiyalaa kivuvaa.', expected: 'මට පෙ.ව. 7.30ට meeting එකක් තියෙනවා office එකෙන් එලියේ සහ ඒක පෙ.ව. 10.30 වෙනකල් තියෙනවා කියලා කිවුවා.' },
  { id: 'Neg_Fun_0011', name: 'Sentence with condition clause mistranslated', input: 'Mata 7.30 AM meeting ekak thiyenavaa office eken eliyee saha eeka 10.30 AM venakal thiyenavaa kiyalaa kivuvaa.', expected: 'මට පෙ.ව. 7.30ට meeting එකක් තියෙනවා office එකෙන් එලියේ සහ ඒක පෙ.ව. 10.30 වෙනකල් තියෙනවා කියලා කිවුවා.' },
];

for (const s of scenarios) {
  test(`${s.id} — ${s.name}`, async ({ page }) => {
    await page.goto('/');

    await enterSinglish(page, s.input);

    // 🔽 Use the ACTUAL output container (adjust selector if needed)
    const output = page.locator('#output, .result, textarea[readonly]').first();

    await expect(output).toBeVisible({ timeout: 5000 });

    const actual = (await output.innerText())
      .replace(/\s+/g, ' ')
      .trim();

    const expected = s.expected
      .replace(/\s+/g, ' ')
      .trim();

    // Negative functional validation (graceful degradation)
    expect(actual).not.toBe(expected);        // not an ideal translation
    expect(actual.length).toBeGreaterThan(0); // still produces output
    expect(actual).toMatch(/[අ-ෆ]/);          // Sinhala characters exist
  });
}
