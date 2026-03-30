// ── ATTENDANCE TRACKER ────────────────────────────────────────────────
        let attEventData = null;   // current event (local mirror)
        let attFilter    = 'ALL';
        let _attUnsub    = null;   // onSnapshot for the active event doc
        let _attPresUnsub = null;  // onSnapshot for presence sessions
        let _attPresSession = null; // this tab's presence doc ID
        let _attPresHeartbeat = null; // setInterval handle

        // ── PRESENCE SYSTEM ───────────────────────────────────────────────────
        // Each tab writes a doc to `presence_sessions` when it opens the panel.
        // Doc auto-expires if not heartbeated (checked via updatedAt < now-90s).
        // onSnapshot on the collection keeps the indicator live for everyone.

        async function _attPresJoin() {
            if (!currentUserData) return;
            try {
                const sessionRef = await addDoc(collection(db, 'presence_sessions'), {
                    panel:     'attendance',
                    eventId:   attEventData?.id || null,
                    uid:       currentUser.uid,
                    callsign:  currentUserData.callsign  || '',
                    rank:      currentUserData.rank       || '',
                    firstName: currentUserData.firstName  || '',
                    lastName:  currentUserData.lastName   || '',
                    updatedAt: new Date().toISOString(),
                });
                _attPresSession = sessionRef.id;
                // Heartbeat every 30s so session stays alive
                _attPresHeartbeat = setInterval(() => _attPresHeartbeatFn(), 30000);
                // Subscribe to all presence docs for this panel
                _attPresSubscribe();
            } catch(e) { console.warn('presence join failed:', e); }
        }

        async function _attPresHeartbeatFn() {
            if (!_attPresSession) return;
            try {
                await updateDoc(doc(db, 'presence_sessions', _attPresSession), {
                    updatedAt: new Date().toISOString(),
                    eventId:   attEventData?.id || null,
                });
            } catch(e) { /* ignore — session may have been cleaned up */ }
        }

        async function _attPresLeave() {
            if (_attPresHeartbeat) { clearInterval(_attPresHeartbeat); _attPresHeartbeat = null; }
            if (_attPresUnsub)     { _attPresUnsub(); _attPresUnsub = null; }
            if (_attPresSession) {
                try { await deleteDoc(doc(db, 'presence_sessions', _attPresSession)); } catch(e) {}
                _attPresSession = null;
            }
            // Hide bar
            const bar = document.getElementById('attPresenceBar');
            if (bar) bar.style.display = 'none';
            const badge = document.getElementById('attNavBadge');
            if (badge) badge.style.display = 'none';
        }

        function _attPresSubscribe() {
            if (_attPresUnsub) { _attPresUnsub(); _attPresUnsub = null; }
            const q = query(
                collection(db, 'presence_sessions'),
                where('panel', '==', 'attendance')
            );
            _attPresUnsub = onSnapshot(q, (snap) => {
                const now = Date.now();
                const STALE_MS = 90000; // 90s — 3× heartbeat interval
                const sessions = [];
                snap.forEach(d => {
                    const data = d.data();
                    const age  = now - new Date(data.updatedAt).getTime();
                    if (age < STALE_MS) sessions.push({id: d.id, ...data});
                });
                _attPresRender(sessions);
            });
        }

        function _attPresRender(sessions) {
            const bar    = document.getElementById('attPresenceBar');
            const chips  = document.getElementById('attPresenceChips');
            const warn   = document.getElementById('attPresenceWarning');
            const badge  = document.getElementById('attNavBadge');
            if (!bar || !chips) return;

            // Others = everyone except this tab's session
            const others = sessions.filter(s => s.id !== _attPresSession);

            // Update sidebar nav badge
            if (badge) {
                if (others.length > 0) {
                    badge.textContent  = others.length;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }

            // Hide bar if alone
            if (others.length === 0) {
                bar.style.display = 'none';
                return;
            }

            bar.style.display = 'block';

            // Build chips — Rank + Callsign (or Last Name fallback)
            chips.innerHTML = others.map(s => {
                const rankAbbr  = getRankAbbr(s.rank || '');
                const callsign  = (s.callsign || '').trim();
                const lastName  = (s.lastName  || '').trim();
                const firstName = (s.firstName || '').trim();
                // Display: "SSgt \"Davy\"" or "SSgt Jones"
                let namePart = '';
                if (callsign && callsign !== firstName) namePart = `"${callsign}"`;
                else if (lastName) namePart = lastName;
                else namePart = callsign || 'Unknown';
                const displayName = [rankAbbr, namePart].filter(Boolean).join(' ');

                // Colour the chip differently if they're on the same event
                const sameEvent = s.eventId && attEventData?.id && s.eventId === attEventData.id;
                const chipBorder = sameEvent ? 'rgba(255,68,68,.6)'  : 'rgba(0,217,255,.35)';
                const chipBg     = sameEvent ? 'rgba(255,68,68,.08)' : 'rgba(0,217,255,.06)';
                const dotColor   = sameEvent ? '#FF6B6B' : '#00D9FF';
                const textColor  = sameEvent ? '#FF9999' : 'rgba(0,217,255,.9)';

                return `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid ${chipBorder};background:${chipBg};font-family:Rajdhani,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;color:${textColor}">
                    <span style="width:7px;height:7px;border-radius:50%;background:${dotColor};flex-shrink:0;animation:attPresencePulse 1.4s ease-in-out infinite"></span>
                    ${esc(displayName)}
                    ${sameEvent ? '<span style="font-size:8px;opacity:.7;margin-left:2px">SAME EVENT</span>' : ''}
                </span>`;
            }).join('');

            // Warning banner — show if ANY other user is on the same event
            const sameEventCount = others.filter(s => s.eventId && attEventData?.id && s.eventId === attEventData.id).length;
            if (warn) warn.style.display = sameEventCount > 0 ? 'block' : 'none';
        }

        // Inject pulse keyframe once
        (function() {
            if (document.getElementById('attPresenceStyle')) return;
            const s = document.createElement('style');
            s.id = 'attPresenceStyle';
            s.textContent = `
                @keyframes attPresencePulse {
                    0%,100% { opacity:1; transform:scale(1); }
                    50%      { opacity:.4; transform:scale(1.3); }
                }
            `;
            document.head.appendChild(s);
        })();

        // Clean up on tab close / navigate away
        window.addEventListener('beforeunload', () => _attPresLeave());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) _attPresLeave();
            // Re-join when tab becomes visible again IF panel is open
            else {
                const panel = document.getElementById('panel-attendance');
                if (panel && !panel.classList.contains('hidden') && !_attPresSession) {
                    _attPresJoin();
                }
            }
        });

        // ── Live-sync helpers ─────────────────────────────────────────────────

        function _attSubscribe(eventId) {
            _attUnsubscribe();
            _attUnsub = onSnapshot(
                doc(db, 'attendance_events', eventId),
                (snap) => {
                    if (!snap.exists()) return;
                    const remote = {id: snap.id, ...snap.data()};
                    attEventData = remote;
                    // Update form fields only if user isn't actively typing
                    const titleEl = document.getElementById('attEventTitle');
                    const dateEl  = document.getElementById('attEventDate');
                    const typeEl  = document.getElementById('attEventType');
                    if (titleEl && document.activeElement !== titleEl) titleEl.value = remote.title || '';
                    if (dateEl  && document.activeElement !== dateEl)  dateEl.value  = remote.date  || '';
                    if (typeEl  && document.activeElement !== typeEl)  typeEl.value  = remote.type  || 'main_op';
                    const lbl = document.getElementById('attCurrentEventLabel');
                    if (lbl) lbl.textContent = remote.title || 'New Event';
                    _attUpdateEditorBadge(remote);
                    // Update presence docs with current event ID so chips show SAME EVENT
                    if (_attPresSession) {
                        updateDoc(doc(db, 'presence_sessions', _attPresSession), {
                            eventId:   eventId,
                            updatedAt: new Date().toISOString(),
                        }).catch(() => {});
                    }
                    renderAttRoster();
                },
                (err) => { console.warn('attSnapshot error:', err); }
            );
        }

        function _attUnsubscribe() {
            if (_attUnsub) { _attUnsub(); _attUnsub = null; }
        }

        function _attUpdateEditorBadge(evData) {
            let badge = document.getElementById('attLiveBadge');
            if (!badge) {
                const lbl = document.getElementById('attCurrentEventLabel');
                if (!lbl) return;
                badge = document.createElement('span');
                badge.id = 'attLiveBadge';
                badge.style.cssText = 'margin-left:10px;font-family:"Share Tech Mono",monospace;font-size:9px;letter-spacing:1px;padding:2px 8px;border:1px solid rgba(0,217,255,.3);color:rgba(0,217,255,.7);vertical-align:middle';
                lbl.parentNode.insertBefore(badge, lbl.nextSibling);
            }
            if (evData.locked) {
                badge.textContent  = '🔒 LOCKED';
                badge.style.color  = '#FFD700';
                badge.style.border = '1px solid rgba(255,215,0,.4)';
            } else if (evData.updatedBy) {
                const ts = evData.updatedAt ? new Date(evData.updatedAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '';
                badge.textContent  = '● LIVE · ' + evData.updatedBy.toUpperCase() + (ts ? ' ' + ts : '');
                badge.style.color  = 'rgba(0,217,255,.7)';
                badge.style.border = '1px solid rgba(0,217,255,.3)';
            } else {
                badge.textContent  = '● LIVE';
                badge.style.color  = 'rgba(0,217,255,.5)';
                badge.style.border = '1px solid rgba(0,217,255,.2)';
            }
        }

        async function _attPersistState() {
            if (!attEventData?.id) return;
            if (attEventData.locked) return;
            try {
                await updateDoc(doc(db, 'attendance_events', attEventData.id), {
                    attendees: attEventData.attendees || [],
                    excused:   attEventData.excused   || [],
                    updatedBy: currentUserData?.callsign || 'Staff',
                    updatedAt: new Date().toISOString(),
                });
            } catch(e) { console.warn('attPersistState failed:', e); }
        }

        // ── Panel load ────────────────────────────────────────────────────────

        window.loadAttendancePanel = async function() {
            const c = document.getElementById('attEventList');
            if (c) c.innerHTML = '<div class="empty-state">LOADING...</div>';
            if (!allUsers.length) await loadAllUsers();
            try {
                const snap = await getDocs(query(collection(db,'attendance_events'), orderBy('date','desc'), limit(20)));
                const events = []; snap.forEach(d => events.push({id:d.id,...d.data()}));
                renderAttEventList(events);
            } catch(e) { if (c) c.innerHTML = '<div class="empty-state">NO EVENTS YET</div>'; }
            const dateEl = document.getElementById('attEventDate');
            if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().split('T')[0];
            renderAttRoster();
            // Join presence if not already in session
            if (!_attPresSession) _attPresJoin();
        };

        function renderAttEventList(events) {
            const c = document.getElementById('attEventList'); if (!c) return;
            if (!events.length) { c.innerHTML = '<div class="empty-state">NO EVENTS LOGGED YET</div>'; return; }
            const typeColors = {main_op:'var(--accent)', patrol:'#7FFF7F', training:'#FFD700', fun_op:'#a78bfa'};
            const typeLabels = {main_op:'MAIN OP', patrol:'PATROL', training:'TRAINING', fun_op:'FUN OP'};
            c.innerHTML = events.map(e => {
                const attendCount  = (e.attendees||[]).length;
                const excusedCount = (e.excused||[]).length;
                const totalActive  = allUsers.filter(u=>u.status!=='pending'&&u.status!=='denied'&&u.platoon!=='Reserves').length;
                const rate         = totalActive>0 ? Math.round((attendCount/totalActive)*100) : 0;
                const rateColor    = rate>=75?'#7FFF7F':rate>=50?'#FFD700':'#FF4444';
                const isActive     = attEventData?.id === e.id;
                return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s;${isActive?'background:rgba(0,217,255,.06);border-left:2px solid var(--accent)':''}" onmouseover="this.style.background='rgba(0,217,255,.03)'" onmouseout="this.style.background='${isActive?'rgba(0,217,255,.06)':''}'">
                    <div style="flex:1;cursor:pointer" onclick="loadAttEvent('${e.id}')">
                        <div style="font-family:Rajdhani,sans-serif;font-size:13px;font-weight:700;color:${isActive?'var(--accent)':'#e0e0e0'}">${esc(e.title||'Untitled')} ${isActive?'<span style="font-size:9px;color:rgba(0,217,255,.6);letter-spacing:1px">[ACTIVE]</span>':''}</div>
                        <div style="font-size:9px;color:#666;letter-spacing:1px;margin-top:2px">${e.date||'—'} · <span style="color:${typeColors[e.type]||'#aaa'}">${typeLabels[e.type]||e.type||'—'}</span>${e.updatedBy ? ` · <span style="color:rgba(0,217,255,.4)">last edit: ${esc(e.updatedBy)}</span>` : ''}</div>
                    </div>
                    <div style="text-align:right;cursor:pointer" onclick="loadAttEvent('${e.id}')">
                        <div style="font-family:Rajdhani,sans-serif;font-size:13px;font-weight:700;color:${rateColor}">${rate}%</div>
                        <div style="font-size:8px;color:#666;letter-spacing:1px">${attendCount} PRESENT${excusedCount>0?' · '+excusedCount+' EXC':''}</div>
                    </div>
                    ${e.locked?`<span style="font-size:9px;color:#FFD700;border:1px solid #FFD70055;padding:1px 6px;font-family:Rajdhani,sans-serif;font-weight:700;letter-spacing:1px;flex-shrink:0">LOCKED</span>`:''}
                    <button class="action-btn remove-btn small" onclick="deleteAttEvent('${e.id}','${esc(e.title||'this event')}')" style="font-size:9px;padding:3px 8px;flex-shrink:0;${e.locked?'opacity:.25;cursor:not-allowed;':''}" ${e.locked?'disabled title="Locked events cannot be deleted"':''}>&#10006;</button>
                </div>`;
            }).join('');
        }

        window.loadAttEvent = async function(eventId) {
            try {
                const snap = await getDoc(doc(db, 'attendance_events', eventId));
                if (!snap.exists()) return;
                attEventData = {id: snap.id, ...snap.data()};
                document.getElementById('attEventTitle').value = attEventData.title || '';
                document.getElementById('attEventDate').value  = attEventData.date  || '';
                document.getElementById('attEventType').value  = attEventData.type  || 'main_op';
                const lbl = document.getElementById('attCurrentEventLabel');
                if (lbl) lbl.textContent = attEventData.title || 'New Event';
                _attSubscribe(eventId);
                renderAttRoster();
                notify('EVENT LOADED — ' + attEventData.title + ' (LIVE SYNC ON)');
            } catch(e) { notify('LOAD FAILED: ' + e.message, 1); }
        };

        window.toggleAttRecentEvents = function() {
            const wrap  = document.getElementById('attEventListWrap');
            const arrow = document.getElementById('attRecentArrow');
            if (!wrap) return;
            const isOpen = wrap.style.display !== 'none';
            wrap.style.display  = isOpen ? 'none' : 'block';
            if (arrow) arrow.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0deg)';
        };

        window.attNewEvent = function() {
            _attUnsubscribe();
            attEventData = null;
            document.getElementById('attEventTitle').value = '';
            document.getElementById('attEventDate').value  = new Date().toISOString().split('T')[0];
            document.getElementById('attEventType').value  = 'main_op';
            const lbl = document.getElementById('attCurrentEventLabel');
            if (lbl) lbl.textContent = 'New Event';
            const badge = document.getElementById('attLiveBadge');
            if (badge) badge.remove();
            // Update presence to show no event loaded
            if (_attPresSession) {
                updateDoc(doc(db, 'presence_sessions', _attPresSession), {
                    eventId: null, updatedAt: new Date().toISOString()
                }).catch(() => {});
            }
            renderAttRoster();
        };

        window.attClearForm = function() {
            _attUnsubscribe();
            attEventData = null;
            document.getElementById('attEventTitle').value = '';
            document.getElementById('attEventDate').value  = new Date().toISOString().split('T')[0];
            document.getElementById('attEventType').value  = 'main_op';
            const lbl = document.getElementById('attCurrentEventLabel');
            if (lbl) lbl.textContent = 'New Event';
            const badge = document.getElementById('attLiveBadge');
            if (badge) badge.remove();
            if (_attPresSession) {
                updateDoc(doc(db, 'presence_sessions', _attPresSession), {
                    eventId: null, updatedAt: new Date().toISOString()
                }).catch(() => {});
            }
            renderAttRoster();
            notify('FORM CLEARED');
        };

        // ── Toggle / mark-all — write-through ────────────────────────────────

        window.attCycleState = async function(uid) {
            if (!attEventData) attEventData = {title:'', date:new Date().toISOString().split('T')[0], type:'main_op', attendees:[], excused:[]};
            if (attEventData.locked) { notify('EVENT IS LOCKED — CANNOT EDIT', 1); return; }
            const att = [...(attEventData.attendees||[])];
            const exc = [...(attEventData.excused||[])];
            const isPresent = att.includes(uid);
            const isExcused = exc.includes(uid);
            if (!isPresent && !isExcused) { att.push(uid); }
            else if (isPresent) { att.splice(att.indexOf(uid),1); exc.push(uid); }
            else { exc.splice(exc.indexOf(uid),1); }
            attEventData.attendees = att;
            attEventData.excused   = exc;
            renderAttRoster();
            await _attPersistState();
        };

        window.attMarkAllExcused = async function() {
            if (!attEventData) attEventData = {title:'', date:new Date().toISOString().split('T')[0], type:'main_op', attendees:[], excused:[]};
            if (attEventData.locked) { notify('EVENT IS LOCKED — CANNOT EDIT', 1); return; }
            let members = allUsers.filter(u=>u.status!=='pending'&&u.status!=='denied'&&u.platoon!=='Reserves');
            if (attFilter !== 'ALL') members = members.filter(u=>u.platoon===attFilter);
            const att = [...(attEventData.attendees||[])];
            const exc = [...(attEventData.excused||[])];
            members.forEach(u => { if (!att.includes(u.id) && !exc.includes(u.id)) exc.push(u.id); });
            attEventData.excused = exc;
            renderAttRoster();
            await _attPersistState();
            notify('ABSENT MEMBERS MARKED EXCUSED');
        };

        // ── Save & Lock ───────────────────────────────────────────────────────

        window.saveAttendance = async function(lock=false) {
            const title = document.getElementById('attEventTitle').value.trim();
            const date  = document.getElementById('attEventDate').value;
            const type  = document.getElementById('attEventType').value;
            if (!title) { notify('EVENT NAME REQUIRED', 1); return; }
            if (!date)  { notify('DATE REQUIRED', 1); return; }
            const btn = document.getElementById('attSaveBtn');
            if (btn) { btn.disabled=true; btn.textContent='SAVING...'; }
            try {
                const attendees    = attEventData?.attendees || [];
                const excused      = attEventData?.excused   || [];
                const eventPayload = {
                    title, date, type, attendees, excused, locked: lock,
                    updatedAt: new Date().toISOString(),
                    updatedBy: currentUserData?.callsign || 'Staff',
                };
                if (attEventData?.id) {
                    await updateDoc(doc(db,'attendance_events',attEventData.id), eventPayload);
                } else {
                    const ref = await addDoc(collection(db,'attendance_events'), {
                        ...eventPayload,
                        createdBy: currentUserData?.callsign || 'Staff',
                        createdAt: new Date().toISOString(),
                    });
                    attEventData = {id: ref.id, ...eventPayload};
                    _attSubscribe(ref.id);
                }
                const lbl = document.getElementById('attCurrentEventLabel');
                if (lbl) lbl.textContent = title;
                if (lock) {
                    _attUnsubscribe();
                    const allActiveMembers = allUsers.filter(u=>u.status!=='pending'&&u.status!=='denied'&&u.platoon!=='Reserves');
                    for (const u of allActiveMembers) {
                        const wasPresent  = attendees.includes(u.id);
                        const wasExcused  = excused.includes(u.id);
                        const opsEligible = (u.opsEligible||0) + (wasExcused?0:1);
                        const opsAttended = (u.opsAttended||0) + (wasPresent?1:0);
                        const att = wasPresent ? Math.min((u.attendance||0)+1, 3) : (u.attendance||0);
                        await updateDoc(doc(db,'users',u.id), {attendance:att, opsAttended, opsEligible, updatedAt:new Date().toISOString()});
                        const local = allUsers.find(x=>x.id===u.id);
                        if (local) { local.attendance=att; local.opsAttended=opsAttended; local.opsEligible=opsEligible; }
                    }
                    notify('EVENT LOCKED & ATTENDANCE SAVED — ' + attendees.length + ' PRESENT');
                    fireWebhook('attendance', {
                        title, date,
                        type:    {main_op:'Main Op',patrol:'Patrol',training:'Training',fun_op:'Fun Op'}[type] || type,
                        present: attendees.length,
                        by:      currentUserData?.callsign || 'Staff',
                    });
                } else {
                    notify('EVENT SAVED — ' + attendees.length + ' MARKED PRESENT');
                }
                await loadAttendancePanel();
            } catch(e) { notify('SAVE FAILED: ' + e.message, 1); }
            if (btn) { btn.disabled=false; btn.textContent='LOG ATTENDANCE'; }
        };

        // ── Delete ────────────────────────────────────────────────────────────

        window.deleteAttEvent = async function(eventId, title) {
            let eventDoc;
            try { eventDoc = await getDoc(doc(db,'attendance_events',eventId)); } catch(e){ notify('ERROR: '+e.message,1); return; }
            if (!eventDoc.exists()) { notify('EVENT NOT FOUND',1); return; }
            const ev = eventDoc.data();
            if (ev.locked) { notify('CANNOT DELETE — EVENT IS LOCKED. LOCKED EVENTS ARE PERMANENT RECORD.',1); return; }
            if (!confirm('DELETE EVENT: "'+title+'"?\n\nMember monthly rates will be recalculated automatically.')) return;
            try {
                const evDoc  = await getDoc(doc(db,'attendance_events',eventId));
                const evData = evDoc.exists() ? evDoc.data() : null;
                await deleteDoc(doc(db,'attendance_events',eventId));
                if (evData && ((evData.attendees||[]).length || (evData.excused||[]).length)) {
                    const remaining     = await getDocs(query(collection(db,'attendance_events'), orderBy('date','desc')));
                    const remainingDocs = remaining.docs.map(d=>({id:d.id,...d.data()}));
                    const allActiveMembers = allUsers.filter(u=>u.status!=='pending'&&u.status!=='denied');
                    for (const u of allActiveMembers) {
                        let opsAtt=0, opsElig=0;
                        remainingDocs.forEach(ev2 => {
                            const att2=ev2.attendees||[], exc2=ev2.excused||[];
                            if (!exc2.includes(u.id)) { opsElig++; if (att2.includes(u.id)) opsAtt++; }
                        });
                        try {
                            await updateDoc(doc(db,'users',u.id),{opsAttended:opsAtt, opsEligible:opsElig, updatedAt:new Date().toISOString()});
                            u.opsAttended=opsAtt; u.opsEligible=opsElig;
                        } catch(e){ console.warn('Rate update failed for '+u.id); }
                    }
                }
                if (attEventData?.id === eventId) {
                    _attUnsubscribe();
                    attClearForm();
                }
                notify('EVENT DELETED — MONTHLY RATES UPDATED');
                logAction('ATT_DELETE', title);
                await loadAttendancePanel();
            } catch(e) { notify('DELETE FAILED: ' + e.message, 1); }
        };

        window.resetAllAttendanceCounters = async function() {
            if (!confirm('RESET ALL ATTENDANCE COUNTERS?\n\nThis will set opsAttended, opsEligible, and attendance to 0 for ALL active members.\n\nOnly use this to clear mock/test data.')) return;
            try {
                const activeMembers = allUsers.filter(u=>u.status!=='pending'&&u.status!=='denied');
                for (const u of activeMembers) {
                    await updateDoc(doc(db,'users',u.id),{opsAttended:0,opsEligible:0,attendance:0,updatedAt:new Date().toISOString()});
                    u.opsAttended=0; u.opsEligible=0; u.attendance=0;
                }
                notify('COUNTERS RESET FOR '+activeMembers.length+' MEMBERS');
                renderAttRoster();
            } catch(e) { notify('RESET FAILED: '+e.message,1); }
        };

        // ── Delegated clicks ──────────────────────────────────────────────────
        document.addEventListener('click', function(e) {
            const el = e.target.closest('.att-name-clickable');
            if (!el) return;
            editAttMonthlyRate(el.dataset.uid, el.dataset.name, parseInt(el.dataset.opsAtt)||0, parseInt(el.dataset.opsElig)||0);
        });

        window.editAttMonthlyRate = function(uid, name, curAtt, curElig) {
            const u = allUsers.find(x=>x.id===uid); if(!u) return;
            const modal = document.getElementById('quickActionModal');
            const title = document.getElementById('qaTitle');
            const body  = document.getElementById('qaBody');
            modal._action = 'monthly_rate';
            modal._uid    = uid;
            title.textContent = '⊞ EDIT MONTHLY RATE — ' + name.toUpperCase();
            body.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:14px">
                    <div style="font-size:10px;letter-spacing:2px;color:#aaa">CORRECT MONTHLY ATTENDANCE RATE IN CASE OF MISTAKE</div>
                    <div style="display:flex;gap:16px">
                        <div style="display:flex;flex-direction:column;gap:4px;flex:1">
                            <label style="font-size:10px;letter-spacing:2px;color:rgba(0,217,255,.7)">OPS ATTENDED</label>
                            <input id="qaMROpsAtt" type="number" min="0" value="${curAtt}"
                                style="background:rgba(0,0,0,.7);border:1px solid rgba(0,217,255,.35);color:#e0e0e0;font-family:'Share Tech Mono',monospace;font-size:28px;font-weight:700;padding:10px;outline:none;text-align:center;width:100%">
                        </div>
                        <div style="display:flex;align-items:center;justify-content:center;font-size:24px;color:#555;padding-top:20px">/</div>
                        <div style="display:flex;flex-direction:column;gap:4px;flex:1">
                            <label style="font-size:10px;letter-spacing:2px;color:rgba(0,217,255,.7)">OPS ELIGIBLE</label>
                            <input id="qaMROpsElig" type="number" min="0" value="${curElig}"
                                style="background:rgba(0,0,0,.7);border:1px solid rgba(0,217,255,.35);color:#e0e0e0;font-family:'Share Tech Mono',monospace;font-size:28px;font-weight:700;padding:10px;outline:none;text-align:center;width:100%">
                        </div>
                    </div>
                    <div style="font-size:9px;color:#555;letter-spacing:1px">Current: ${curAtt}/${curElig} &nbsp;|&nbsp; OPS ELIGIBLE cannot be less than OPS ATTENDED</div>
                </div>`;
            modal.style.display = 'flex';
        };

        window.setAttFilter = function(platoon) {
            attFilter = platoon;
            document.querySelectorAll('.att-ftab').forEach(b=>{
                const active = b.dataset.platoon === platoon;
                b.style.background  = active ? 'rgba(0,217,255,.12)' : 'transparent';
                b.style.color       = active ? 'var(--accent)' : '#888';
                b.style.borderColor = active ? 'rgba(0,217,255,.5)' : 'rgba(0,217,255,.2)';
            });
            renderAttRoster();
        };

        function renderAttRoster() {
            const c = document.getElementById('attRosterList'); if (!c) return;
            const attendees = attEventData?.attendees || [];
            const excused   = attEventData?.excused   || [];
            const locked    = attEventData?.locked    || false;
            let members = allUsers.filter(u=>u.status!=='pending'&&u.status!=='denied'&&u.platoon!=='Reserves');
            if (attFilter !== 'ALL') members = members.filter(u=>u.platoon===attFilter);
            members.sort((a,b)=>(a.platoon||'').localeCompare(b.platoon||'')||(a.callsign||'').localeCompare(b.callsign||''));
            let present=0,exc=0,absent=0;
            members.forEach(u=>{ if(attendees.includes(u.id)) present++; else if(excused.includes(u.id)) exc++; else absent++; });
            const total=members.length;
            const rate=total>0?Math.round((present/total)*100):0;
            const pEl=document.getElementById('attStatPresent'); if(pEl) pEl.textContent=present;
            const rEl=document.getElementById('attStatRate');    if(rEl){ rEl.textContent=rate+'%'; rEl.style.color=rate>=75?'#7FFF7F':rate>=50?'#FFD700':'#FF4444'; }
            const eEl=document.getElementById('attStatExcused'); if(eEl) eEl.textContent=exc;
            const aEl=document.getElementById('attStatAbsent');  if(aEl) aEl.textContent=absent;
            const pb=document.getElementById('attStatPresentBar'); if(pb) pb.style.width=Math.round((present/Math.max(total,1))*100)+'%';
            const rb=document.getElementById('attStatRateBar');    if(rb){ rb.style.width=rate+'%'; rb.style.background=rate>=75?'#7FFF7F':rate>=50?'#FFD700':'#FF4444'; }
            const eb=document.getElementById('attStatExcusedBar'); if(eb) eb.style.width=Math.round((exc/Math.max(total,1))*100)+'%';
            const ab2=document.getElementById('attStatAbsentBar'); if(ab2) ab2.style.width=Math.round((absent/Math.max(total,1))*100)+'%';
            if (!members.length){ c.innerHTML='<div class="empty-state">NO MEMBERS IN THIS PLATOON</div>'; return; }
            const platoonColors={'Command':'#a78bfa','1st Platoon':'#8aad44','2nd Platoon':'#8aad44','3rd Platoon':'#8aad44','Force Recon':'#a47de0','Corpsmen':'#34d399','Pilot':'#00D9FF'};
            c.innerHTML = members.map(u=>{
                const isPresent=attendees.includes(u.id);
                const isExcused=excused.includes(u.id);
                const opsElig=u.opsEligible||0, opsAtt=u.opsAttended||0;
                const monthRate=opsElig>0?Math.round((opsAtt/opsElig)*100):null;
                const mrColor=monthRate===null?'#555':monthRate>=75?'#7FFF7F':monthRate>=50?'#FFD700':'#FF4444';
                const platColor=platoonColors[u.platoon]||'var(--accent)';
                const rowBg=isPresent?'rgba(0,217,255,.025)':isExcused?'rgba(255,212,0,.02)':'';
                return `<div style="display:grid;grid-template-columns:1fr 120px 130px 70px;gap:0;border-bottom:1px solid rgba(255,255,255,.04);padding:10px 14px;align-items:center;background:${rowBg}" onmouseover="this.style.background='rgba(0,217,255,.03)'" onmouseout="this.style.background='${rowBg}'">
                    <div>
                        <div class="att-name-clickable" data-uid="${u.id}" data-name="${esc(formatMemberName(u)||u.callsign)}" data-ops-att="${opsAtt}" data-ops-elig="${opsElig}" style="font-family:Rajdhani,sans-serif;font-size:14px;font-weight:700;color:#e0e0e0;cursor:pointer;text-decoration:underline dotted rgba(0,217,255,.3)" title="Click to correct monthly rate">${esc(formatMemberName(u)||u.callsign)}</div>
                        <div style="font-size:9px;color:#666;letter-spacing:1px;margin-top:1px">${esc(u.rank||'—')}</div>
                    </div>
                    <div style="text-align:center">
                        ${u.platoon?`<span style="font-family:Rajdhani,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;padding:3px 10px;border:1px solid ${platColor}55;color:${platColor}">${esc(u.platoon)}</span>`:'<span style="color:#555">—</span>'}
                    </div>
                    <div style="text-align:center">
                        <div style="font-family:Rajdhani,sans-serif;font-size:14px;font-weight:700;color:${mrColor}">${monthRate!==null?monthRate+'%':'—'}</div>
                        ${monthRate!==null?`<div style="font-size:9px;color:#555;letter-spacing:1px">(${opsAtt}/${opsElig})</div>`:''}
                    </div>
                    <div style="text-align:center">
                        ${locked
                            ?`<span style="font-size:14px;color:${isPresent?'#7FFF7F':isExcused?'#FFD700':'#FF4444'}">${isPresent?'✓':isExcused?'⊘':'✗'}</span>`
                            :`<button onclick="attCycleState('${u.id}')" style="background:${isPresent?'rgba(0,217,255,.12)':isExcused?'rgba(255,212,0,.12)':'rgba(255,255,255,.04)'};border:1px solid ${isPresent?'var(--accent)':isExcused?'#FFD700':'#555'};color:${isPresent?'#7FFF7F':isExcused?'#FFD700':'#FF4444'};font-family:Rajdhani,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;padding:4px 8px;cursor:pointer;min-width:64px;transition:all .15s" title="Click to cycle: Absent → Present → Excused">${isPresent?'✓ PRESENT':isExcused?'⊘ EXCUSED':'✗ ABSENT'}</button>`
                        }
                    </div>
                </div>`;
            }).join('');
        }
        // ── END ATTENDANCE TRACKER ────────────────────────────────────────────
        