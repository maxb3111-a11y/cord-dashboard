/**
 * C.O.R.D. Second Brain — Optional JSON API Bridge for the Next.js Web Dashboard
 *
 * Paste these two functions (doGetApi / doPost) into your existing C.O.R.D. Google Apps Script
 * project and set Script Property `CORD_API_SECRET` to a random password string.
 * Then copy your deployed Web App URL into `.env.local` as `CORD_APPS_SCRIPT_URL`.
 */

function isValidApiSecret_(secret) {
  var expected = PropertiesService.getScriptProperties().getProperty('CORD_API_SECRET');
  return Boolean(expected && secret && String(secret) === String(expected));
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * If your script already has doGet(e) returning HtmlService, add this check at the very top of doGet(e):
 *   if (e && e.parameter && e.parameter.action === 'dashboard') return handleCordDashboardApiGet_(e);
 */
function handleCordDashboardApiGet_(e) {
  if (!isValidApiSecret_(e.parameter.secret)) {
    return jsonOut_({ ok: false, error: 'Unauthorized' });
  }
  var dash = getDashboardData();
  var tasks = (dash.tasks || []).map(function (t, idx) {
    return {
      id: t.id,
      title: t.title,
      estimatedMinutes: t.minutes || 5,
      notes: t.notes || '',
      due: t.due || '',
      priority: idx + 1,
      waiting: /@waiting/i.test(t.title || ''),
      source: 'google'
    };
  });

  var drafts = GmailApp.getDrafts().slice(0, 5).map(function (d) {
    var m = d.getMessage();
    return {
      id: d.getId(),
      subject: m.getSubject() || '(no subject)',
      from: 'Draft',
      snippet: m.getPlainBody().slice(0, 120),
      date: 'Draft',
      kind: 'draft'
    };
  });

  return jsonOut_({
    ok: true,
    data: {
      tasks: tasks.filter(function (t) { return !t.waiting; }),
      waitingTasks: tasks.filter(function (t) { return t.waiting; }),
      events: dash.events || [],
      gmail: drafts,
      meals: dash.mealsSummary || {
        today: { dayLabel: 'Today', breakfast: 'Not planned', lunch: 'Not planned', dinner: 'Not planned' },
        tomorrow: { dayLabel: 'Tomorrow', breakfast: 'Not planned', lunch: 'Not planned', dinner: 'Not planned' }
      },
      weather: dash.weatherSummary || {
        location: 'Brighton & Hove',
        tempC: 8,
        windKts: 9,
        seaTempC: 11.8,
        waveHeightM: 1.1,
        tideState: 'Falling',
        points: []
      }
    }
  });
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!isValidApiSecret_(body.secret)) {
      return jsonOut_({ ok: false, error: 'Unauthorized' });
    }

    if (body.action === 'create_task') {
      insertTask(body.title || 'New task', body.estimatedMinutes || 10, body.details || '', body.dueDateIso || null);
      return jsonOut_({ ok: true });
    }
    if (body.action === 'complete_task' && body.taskId) {
      Tasks.Tasks.patch({ status: 'completed' }, DEFAULT_LIST, body.taskId);
      return jsonOut_({ ok: true });
    }
    if (body.action === 'create_draft') {
      GmailApp.createDraft(body.recipientEmail || '', body.title || '(no subject)', body.details || '');
      return jsonOut_({ ok: true });
    }
    if (body.action === 'create_event') {
      var start = body.dueDateIso ? new Date(body.dueDateIso) : new Date(Date.now() + 3600000);
      var end = body.endTimeIso ? new Date(body.endTimeIso) : new Date(start.getTime() + 3600000);
      CalendarApp.getDefaultCalendar().createEvent(body.title || 'Event', start, end, { description: body.details || '' });
      return jsonOut_({ ok: true });
    }
    if (body.action === 'reorder_tasks') {
      return jsonOut_({ ok: true });
    }

    return jsonOut_({ ok: false, error: 'Unknown action: ' + body.action });
  } catch (err) {
    return jsonOut_({ ok: false, error: err.message });
  }
}
