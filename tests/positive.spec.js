const { test, expect } = require('@playwright/test');

/**
 * Helper: Enter Singlish text into available input field
 */
async function enterSinglish(page, text) {
  // Try labelled textbox first
  const singlishBox = page.getByRole('textbox', { name: /Singlish/i });
  if (await singlishBox.count() > 0) {
    await singlishBox.first().fill('');
    await singlishBox.first().fill(text);
    return;
  }

  // Fallback: textarea
  const ta = page.locator('textarea');
  if (await ta.count() > 0) {
    await ta.first().fill('');
    await ta.first().fill(text);
    return;
  }

  // Fallback: contenteditable
  const ce = page.locator('[contenteditable="true"]');
  if (await ce.count() > 0) {
    await ce.first().click();
    await page.keyboard.insertText(text);
    return;
  }

  // Fallback: any input
  const input = page.locator('input[type="text"], input');
  if (await input.count() > 0) {
    await input.first().fill('');
    await input.first().fill(text);
    return;
  }

  throw new Error('Singlish input field not found.');
}

// Positive scenarios array (IDs, names, inputs, expected Sinhala)
const scenarios = [
  { id: 'Pos_Fun_0001', name: 'Convert simple daily statement', input: 'mama udhaeesanama gedhara yanavaa.', expected: 'මම උදෑසනම ගෙදර යනවා.' },
  { id: 'Pos_Fun_0002', name: 'Convert compound sentence', input: 'api kadayakata yanavaa kaeema kanna saha passe api kattiyama chithrapatayak balanavaa.', expected: 'අපි කඩයකට යනවා කෑම කන්න සහ පස්සෙ අපි කට්ටියම චිත්‍රපටයක් බලනවා.' },
  { id: 'Pos_Fun_0003', name: 'Convert complex conditional sentence', input: 'oyaa maava balanna kavadhdha enna hithan inne?', expected: 'ඔයා මාව බලන්න කවද්ද එන්න හිතන් ඉන්නේ?' },
  { id: 'Pos_Fun_0004', name: 'Convert interrogative question', input: 'oyaa  apiva ekkan yanna kavadhdha enna hithan inne?', expected: 'ඔයා අපිව එක්කන් යන්න කවද්ද එන්න හිතන් ඉන්නේ?' },
  { id: 'Pos_Fun_0005', name: 'Convert imperative command', input: 'vahaama gedhara enna.', expected: 'වහාම ගෙදර එන්න.' },
  { id: 'Pos_Fun_0006', name: 'Convert negative sentence', input: 'mama ehema hora vaeda karanne naehae.', expected: 'මම එහෙම හොර වැඩ කරන්නේ නැහැ.' },
  { id: 'Pos_Fun_0007', name: 'Convert polite request', input: 'karuNaakaralaa mata podi udhavvak karanna puLuvandha?', expected: 'කරුණාකරලා මට පොඩි උදව්වක් කරන්න පුළුවන්ද?' },
  { id: 'Pos_Fun_0008', name: 'Convert informal phrasing', input: 'oyaa meeka mee vidhata karapan.', expected: 'ඔයා මේක මේ විදට කරපන්.' },
  { id: 'Pos_Fun_0009', name: 'Convert present tense', input: 'mama dhaen gedhara vaeda karanavaa.', expected: 'මම දැන් ගෙදර වැඩ කරනවා.' },
  { id: 'Pos_Fun_0010', name: 'Convert past tense sentence', input: 'api iiyee gedhara giyaa.', expected: 'අපි ඊයේ ගෙදර ගියා.' },
  { id: 'Pos_Fun_0011', name: 'Convert future tense', input: 'api iiLaGa sathiyee vinodha chaarikaavak gedhara kattiya ekka yamu.', expected: 'අපි ඊළඟ සතියේ විනොද චාරිකාවක් ගෙදර කට්ටිය එක්ක යමු.' },
  { id: 'Pos_Fun_0012', name: 'Convert plural pronoun usage', input: 'oyaalaa heta Havasa gaallee avoth apivath hambavenna enavadha?', expected: 'ඔයාලා හෙට හවස ගාල්ලේ අවොත් අපිවත් හම්බවෙන්න එනවද?' },
  { id: 'Pos_Fun_0013', name: 'Convert repeated words for emphasis', input: 'Hari hari oyaa kohomath mata vadaa adha lassanayi.', expected: 'හරි හරි ඔයා කොහොමත් මට වඩා අද ලස්සනයි.' },
  { id: 'Pos_Fun_0014', name: 'Convert joined words without spaces', input: 'mamagedharayanavaasikuradhaa.', expected: 'මමගෙදරයනවාසිකුරදා.' },
  { id: 'Pos_Fun_0015', name: 'Convert mixed Singlish + English', input: 'heta mata zoom meeting ekak thiyenavaa ee nisaa mama adha havasa train ekee gedhara yanavaa.', expected: 'හෙට මට zoom meeting එකක් තියෙනවා ඒ නිසා මම අද හවස train එකේ ගෙදර යනවා.' },
  { id: 'Pos_Fun_0016', name: 'Convert place names correctly', input: 'apee panthiyee lamayi tika ekathu velaa Kandy valata trip ekak yamu.', expected: 'අපේ පන්තියේ ලමයි ටික එකතු වෙලා Kandy වලට trip එකක් යමු.' },
  { id: 'Pos_Fun_0017', name: 'Convert currency format', input: 'Mata oyagen Rs. 5500 ganna ooni.', expected: 'මට ඔයගෙන් Rs. 5500 ගන්න ඕනි.' },
  { id: 'Pos_Fun_0018', name: 'Convert time format', input: 'Mata 7.30 AM meeting ekak thiyenavaa saha ee meeting eka 10.30 AM venakal thiyenavaa.', expected: 'මට 7.30 AM meeting එකක් තියෙනවා සහ ඒ meeting එක 10.30 AM වෙනකල් තියෙනවා.' },
  { id: 'Pos_Fun_0019', name: 'Convert multiple spaces', input: 'mata  dhaen  vaedata  yanna  venavaa.', expected: 'මට  දැන්  වැඩට  යන්න  වෙනවා.' },
  { id: 'Pos_Fun_0020', name: 'Convert multiline input', input: 'mama gedhara yanavaa. oyaa enavadha?', expected: 'මම ගෙදර යනවා. ඔයා එනවද?' },
  { id: 'Pos_Fun_0021', name: 'Convert slang expression', input: 'eeka nice machan! supiri!', expected: 'ඒක nice මචන්! සුපිරි!' },
  { id: 'Pos_Fun_0022', name: 'Convert technical abbreviations', input: 'mage number eka app ekata login vedhdhi dhunnahama OTP eka SMS ekakin enavaa.', expected: 'mage number එක app එකට login වෙද්දි දුන්නහම OTP එක SMS එකකින් එනවා.' },
  { id: 'Pos_Fun_0023', name: 'Convert long paragraph input', input: ' School kale apee panthiye pirimi  set eka udheema thiyena period eka maga haerala sellam karanna play ground ekata giyaa. passee kattiya ekathu velaa krikat match ekak gaehuvaa. kohoma hari paeyak vithara palaveni match eka gaehuvaa . passe api aayeth thava match ekak gahanna patan gaththaa. Ohoma dhevani match eka gagaha innakota eka paarama kohendhamandhaa panthiBhaara teacher play ground ekata aavaa. haebaeyi    aave nikan nemei vidhuhalpathithumath ekkamayi. Ekapaara eyaalaa  ground ekata aavaa vitharayi api passa balanne naethuva dhivvaa . kohoma hari panthiyee Lamayi tika eka eka thaenvala gihin haengunaa . maayi thava Lamayi ennekuyi apee school ekee toilet ekee haengunaa.', expected: 'School kale අපේ පන්තියෙ පිරිමි  සෙට් එක උදේම තියෙන period එක මග හැරල සෙල්ලම් කරන්න play ground එකට ගියා. පස්සේ කට්ටිය එකතු වෙලා ක්‍රිකට් match එකක් ගැහුවා. කොහොම හරි පැයක් විතර පලවෙනි match එක ගැහුවා . පස්සෙ අපි ආයෙත් තව match එකක් ගහන්න පටන් ගත්තා. ඔහොම දෙවනි match එක ගගහ ඉන්නකොට එක පාරම කොහෙන්දමන්දා පන්තිභාර teacher play ground එකට ආවා. හැබැයි    ආවෙ නිකන් නෙමේ විදුහල්පතිතුමත් එක්කමයි. එකපාර එයාලා  ground එකට ආවා විතරයි අපි පස්ස බලන්නෙ නැතුව දිව්වා . කොහොම හරි පන්තියේ ළමයි ටික එක එක තැන්වල ගිහින් හැන්ගුනා . මායි තව ළමයි එන්නෙකුයි අපේ school එකේ toilet එකේ හැන්ගුනා.' },
  { id: 'Pos_Fun_0024', name: 'Convert request with medium politeness', input: 'puluvannam mata eeka sambanDhava dheeval evanna.', expected: 'පුලුවන්නම් මට ඒක සම්බන්ධව දේවල් එවන්න.' },
  { id: 'Pos_Fun_0025', name: 'Convert medium-length polite request', input: 'karuNaakaralaa mata podi udhavvak karanna puLuvandha? mama aduma adha havasata report eka ivara karanna balannee.', expected: 'කරුණාකරලා මට පොඩි උදව්වක් කරන්න පුළුවන්ද? මම අඩුම අද හවසට report එක ඉවර කරන්න බලන්නේ.' },
  
];

for (const s of scenarios) {
  test(`${s.id} — ${s.name}`, async ({ page }) => {
    await page.goto('https://swifttranslator.com');

    await enterSinglish(page, s.input);

    // Layout-agnostic assertion: Sinhala output must appear in page body
    await expect(page.locator('body')).toContainText(s.expected, {
      timeout: 10000
    });
  });
}