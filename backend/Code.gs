/**
 * Backend für das Anmeldung-Formular der Spielgruppe Rägiräupli.
 * Deployment-Anleitung: siehe backend/ANLEITUNG.md
 *
 * Nimmt eine POST-Anfrage vom Anmeldung-Formular entgegen, verschickt
 * eine E-Mail an Alessia und trägt die Anmeldung als neue Zeile im
 * verknüpften Google Sheet ein (Status-Spalte startet bei "Anfrage").
 */

var NOTIFY_EMAIL = 'alessia.spielgruppe@outlook.com';
var SHEET_NAME = 'Anmeldungen';

var COLUMNS = [
  'Datum', 'Status', 'Kind', 'Geburtsdatum', 'Nationalität', 'Muttersprache',
  'Allergien', 'Gesundheitsinfo', 'Geschwister', 'Elternteil', 'Strasse',
  'PLZ/Ort', 'Bringt/Holt', 'Bringt/Holt (Andere)', 'E-Mail', 'Telefon',
  'Telefon Mutter', 'Telefon Vater', 'Häufigkeit', 'Gewünschte Tage', 'Sprache'
];

function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  appendToSheet(data);
  sendNotificationEmail(data);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    setupStatusDropdown(sheet);
  }
  return sheet;
}

function setupStatusDropdown(sheet) {
  var statusCol = COLUMNS.indexOf('Status') + 1;
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Anfrage', 'Aktiv', 'Abgelehnt'], true)
    .setAllowInvalid(false)
    .build();
  // Dropdown für die nächsten 500 Zeilen vorbereiten.
  sheet.getRange(2, statusCol, 500, 1).setDataValidation(rule);
}

function appendToSheet(data) {
  var sheet = getOrCreateSheet();
  sheet.appendRow([
    new Date(),
    'Anfrage',
    data.childName || '',
    data.birthdate || '',
    data.nationality || '',
    data.motherTongue || '',
    data.allergies || '',
    data.healthInfo || '',
    data.siblings || '',
    data.parentName || '',
    data.street || '',
    data.plzOrt || '',
    data.whoBrings || '',
    data.whoBringsOther || '',
    data.email || '',
    data.phone || '',
    data.phoneMother || '',
    data.phoneFather || '',
    data.frequency || '',
    data.days || '',
    data.lang || ''
  ]);
}

function sendNotificationEmail(data) {
  var subject = 'Neue Anmeldung: ' + (data.childName || '(kein Name)');
  var body =
    'Neue Anmeldung über die Website:\n\n' +
    'Kind: ' + (data.childName || '-') + '\n' +
    'Geburtsdatum: ' + (data.birthdate || '-') + '\n' +
    'Nationalität: ' + (data.nationality || '-') + '\n' +
    'Muttersprache: ' + (data.motherTongue || '-') + '\n' +
    'Allergien: ' + (data.allergies || '-') + '\n' +
    'Gesundheitsinfo: ' + (data.healthInfo || '-') + '\n' +
    'Geschwister: ' + (data.siblings || '-') + '\n\n' +
    'Elternteil: ' + (data.parentName || '-') + '\n' +
    'Adresse: ' + (data.street || '-') + ', ' + (data.plzOrt || '-') + '\n' +
    'Wer bringt/holt: ' + (data.whoBrings || '-') +
      (data.whoBringsOther ? ' (' + data.whoBringsOther + ')' : '') + '\n' +
    'E-Mail: ' + (data.email || '-') + '\n' +
    'Telefon: ' + (data.phone || '-') + '\n' +
    'Telefon Mutter: ' + (data.phoneMother || '-') + '\n' +
    'Telefon Vater: ' + (data.phoneFather || '-') + '\n\n' +
    'Häufigkeit: ' + (data.frequency || '-') + '\n' +
    'Gewünschte Tage: ' + (data.days || '-') + '\n\n' +
    'Status in der Tabelle: Anfrage (bitte manuell auf "Aktiv" ändern, sobald' +
    ' das Kind angemeldet ist).';

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}
