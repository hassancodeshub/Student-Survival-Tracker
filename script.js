var db_state = null; 
const ST_KEY = 'spendwise_student_data';

function getTip() {
    var t = [
        "Don't order Zomato at 2 AM, it drains the wallet.",
        "Track the chai & nashta expenses, they add up faster than tuition fees.",
        "Use student IDs for Spotify and Apple Music.",
        "If you're broke, it's Maggi time.",
        "Tracking every single transaction reveals where your money is leaking."
    ];
    return t[Math.floor(Math.random() * t.length)];
}

function doHash(s) {
    let x = 0;
    for(let i=0; i<s.length; i++) {
        x = ((x<<5)-x)+s.charCodeAt(i); 
        x = x&x; 
    }
    return Math.abs(x).toString(16);
}

function startAppFlow() {
    var overlay = document.getElementById('login-overlay');
    var wrapper = document.getElementById('secure-app-wrapper');
    wrapper.style.visibility = 'hidden'; 
    wrapper.style.opacity = '0';

    if(db_state.prof.n == '' || db_state.prof.pHash == '') {
        overlay.classList.add('active');
        document.getElementById('setup-form').classList.remove('hidden');
        document.getElementById('auth-form').classList.add('hidden');
        document.getElementById('login-title').innerText = "Setup SpendWise";

        document.getElementById('setup-form').onsubmit = function(e) {
            e.preventDefault();
            var p1 = document.getElementById('setup-pin').value;
            var p2 = document.getElementById('setup-pin-confirm').value;
            if(p1 != p2) { showMsg("Pins do not match bro", "error"); return; }

            db_state.prof.n = document.getElementById('setup-name').value.replace(/[<>]/g, "");
            db_state.prof.budget_base = parseFloat(document.getElementById('setup-budget').value).toFixed(2);
            db_state.prof.pHash = doHash(p1);
            localStorage.setItem(ST_KEY, JSON.stringify(db_state));
            
            overlay.classList.remove('active');
            wrapper.style.visibility = 'visible'; wrapper.style.opacity = '1';
            setupAllTheEvents();
        }
    } else {
        overlay.classList.add('active');
        document.getElementById('setup-form').classList.add('hidden');
        document.getElementById('auth-form').classList.remove('hidden');
        document.getElementById('login-title').innerText = "Wassup, " + db_state.prof.n;

        document.getElementById('auth-form').onsubmit = function(e) {
            e.preventDefault();
            var entered = document.getElementById('auth-pin').value;
            if(doHash(entered) == db_state.prof.pHash) {
                overlay.classList.remove('active');
                document.getElementById('auth-pin').value = '';
                wrapper.style.visibility = 'visible'; wrapper.style.opacity = '1';
                setupAllTheEvents();
            } else {
                showMsg("Incorrect PIN", "error");
            }
        }
    }
}

var tmr = null;
function showMsg(m, t) {
    var box = document.getElementById('toast-container');
    var d = document.createElement('div');
    d.className = 'toast ' + (t || 'info');
    d.innerText = m;
    box.appendChild(d);
    if(tmr) clearTimeout(tmr);
    tmr = setTimeout(function(){
        d.style.opacity = '0';
        setTimeout(function(){ d.remove(); }, 300);
    }, 2500);
}

var isSetupDone = false;

function forceUIUpdate() {
    var prf = db_state.prof;
    document.getElementById('set-name').value = prf.n;
    document.getElementById('set-currency').value = prf.curr;
    document.getElementById('greeting').innerText = "Hello, " + prf.n;
    document.getElementById('current-month-display').innerText = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    var mon = new Date().getMonth();
    var yr = new Date().getFullYear();
    
    var initial_starting_balance = parseFloat(prf.budget_base) || 0;
    
    var past_rollover = initial_starting_balance;
    var this_mo_income = 0;
    var this_mo_expense = 0;
    var this_mo_txs = [];

    // Continuous Ledger Math
    for(var k=0; k<db_state.txs.length; k++) {
        var t = db_state.txs[k];
        var dparts = t.date.split('-');
        var t_yr = parseInt(dparts[0]);
        var t_mon = parseInt(dparts[1]) - 1;
        var amt = parseFloat(t.amount);

        if(t_yr == yr && t_mon == mon) {
            this_mo_txs.push(t);
            if(t.type == 'income') this_mo_income += amt;
            else this_mo_expense += amt;
        } else if (t_yr < yr || (t_yr == yr && t_mon < mon)) {
            if(t.type == 'income') past_rollover += amt;
            else past_rollover -= amt;
        }
    }

    var total_pool_this_month = past_rollover + this_mo_income;
    var available = total_pool_this_month - this_mo_expense;
    
    var d_in_m = new Date(yr, mon+1, 0).getDate();
    var r_days = d_in_m - new Date().getDate() + 1;
    if(r_days<1) r_days=1;
    var daily_allowance = available > 0 ? available/r_days : 0;

    document.getElementById('dash-budget').innerText = prf.curr + total_pool_this_month.toFixed(2);
    document.getElementById('dash-spent').innerText = prf.curr + this_mo_expense.toFixed(2);
    document.getElementById('dash-remaining').innerText = prf.curr + available.toFixed(2);
    
    if(available < 0) {
        document.getElementById('dash-remaining-card').classList.add('danger');
        document.getElementById('dash-remaining').style.color = 'var(--danger)';
    } else {
        document.getElementById('dash-remaining-card').classList.remove('danger');
        document.getElementById('dash-remaining').style.color = '';
    }

    document.getElementById('dash-safe-weekly').innerText = prf.curr + (daily_allowance*7).toFixed(2);
    document.getElementById('dash-safe-daily').innerText = prf.curr + daily_allowance.toFixed(2);

    var no_spend = 0;
    for(let d=1; d<=new Date().getDate(); d++) {
        var did_spend = false;
        var check_str = yr + '-' + String(mon+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        for(let t=0; t<this_mo_txs.length; t++) {
            if(this_mo_txs[t].date == check_str && this_mo_txs[t].type == 'expense') did_spend = true;
        }
        if(!did_spend) no_spend++;
    }
    document.getElementById('dash-no-spend').innerText = no_spend;

    var pct = 0;
    if(total_pool_this_month > 0) pct = Math.min((this_mo_expense/total_pool_this_month)*100, 100);
    
    var pb = document.getElementById('dash-progress-bar');
    pb.style.width = pct + '%';
    document.getElementById('dash-progress-text').innerText = pct.toFixed(1) + '% utilized';
    if(pct>=100) pb.style.backgroundColor = 'var(--danger)';
    else if(pct>80) pb.style.backgroundColor = 'orange';
    else if(pct>50) pb.style.backgroundColor = 'var(--warning)';
    else pb.style.backgroundColor = 'var(--success)';

    drawTable(document.getElementById('dash-expense-list'), db_state.txs.slice(0,5), false);
    drawTable(document.getElementById('expenses-full-list'), db_state.txs, true);
    buildGoalsUI();
}

function drawTable(domEl, arr, canEdit) {
    if(!arr || arr.length==0) { domEl.innerHTML = '<p class="empty-state-small">Empty ledger.</p>'; return; }
    var str = '';
    for(var i=0; i<arr.length; i++) {
        var x = arr[i];
        var isInc = x.type == 'income';
        var dp = x.date.split('-');
        var nd = new Date(dp[0], dp[1]-1, dp[2]).toLocaleDateString(undefined, {month:'short', day:'numeric'});
        
        var tclr = isInc ? 'text-success' : '';
        var tsign = isInc ? '+' : '-';
        
        var delHTML = canEdit ? `<button class="btn btn-text text-danger" style="font-size:0.8rem; margin-top:4px;" onclick="killRow('${x.id}')">Delete</button>` : '';
        var s_title = x.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

        str += `<div class="expense-item">
            <div class="expense-info">
                <h4>${s_title}</h4>
                <span class="expense-meta">${x.category} • ${nd}</span>
            </div>
            <div style="text-align:right">
                <div class="expense-amount ${tclr}">${tsign}${db_state.prof.curr}${parseFloat(x.amount).toFixed(2)}</div>
                ${delHTML}
            </div>
        </div>`;
    }
    domEl.innerHTML = str;
}

window.killRow = function(id) {
    if(confirm("Sure?")) {
        db_state.txs = db_state.txs.filter(function(t){ return t.id != id; });
        localStorage.setItem(ST_KEY, JSON.stringify(db_state));
        forceUIUpdate();
    }
};

function buildGoalsUI() {
    var gl = document.getElementById('goals-list');
    if(!db_state.gls || db_state.gls.length==0) { gl.innerHTML = '<p class="empty-state-small">No goals.</p>'; return; }
   
    var html = '';
    for(var i=0; i<db_state.gls.length; i++) {
        var g = db_state.gls[i];
        var p = Math.min((g.current/g.target)*100, 100).toFixed(1);
        var dp = g.deadline.split('-');
        var dl = Math.ceil((new Date(dp[0], dp[1]-1, dp[2]) - new Date()) / 86400000);
        var timeStr = dl < 0 ? "Past deadline" : (dl === 0 ? "Due today" : `${dl} days left`);
       
        // Calculate Required Daily Savings
        var remaining = g.target - g.current;
        var dailyStr = "";
        if (remaining > 0) {
            var safe_dl = dl > 0 ? dl : 1; // Prevent dividing by zero if deadline is today/past
            var reqDaily = remaining / safe_dl;
            dailyStr = `Need: ${db_state.prof.curr}${reqDaily.toFixed(2)} / day`;
        } else {
            dailyStr = `<strong class="text-success">Goal Achieved!</strong>`;
        }

        // Only show Add Funds button if the goal isn't finished
        var addBtnHtml = remaining > 0 ? `<button class="btn btn-secondary w-100" style="margin-top: 12px; padding: 8px; font-size: 0.9rem;" onclick="openFundGoal('${g.id}')">+ Add Funds</button>` : '';

        html += `<div class="card goal-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h3>${g.name.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</h3>
                <button class="btn btn-text text-danger" style="font-size:0.8rem" onclick="killGoal('${g.id}')">Drop</button>
            </div>
            <div class="goal-meta">Target: ${db_state.prof.curr}${g.target.toFixed(2)}</div>
            <div class="progress-bar-container"><div class="progress-bar" style="width:${p}%; background-color:var(--emerald);"></div></div>
            <div class="goal-stats"><span>Saved: ${db_state.prof.curr}${g.current.toFixed(2)}</span><span>${timeStr}</span></div>
            <div class="goal-stats" style="color: var(--text-muted); margin-top: 4px;">${dailyStr}</div>
            ${addBtnHtml}
        </div>`;
    }
    gl.innerHTML = html;
}

window.killGoal = function(id) {
    if(confirm("Drop goal?")) {
        db_state.gls = db_state.gls.filter(function(x){ return x.id != id; });
        localStorage.setItem(ST_KEY, JSON.stringify(db_state));
        buildGoalsUI();
    }
};

// Opens the new Add Funds modal
window.openFundGoal = function(id) {
    document.getElementById('fund-goal-form').reset();
    document.getElementById('fg-id').value = id;
    document.getElementById('fund-goal-modal').classList.add('active');
};

function buildInsights() {
    var wrap = document.getElementById('insights-container');
    var m = new Date().getMonth();
    var y = new Date().getFullYear();
    
    var total_available = parseFloat(db_state.prof.budget_base) || 0;
    var zomato_tax = 0;
    var this_mo_exp = 0;

    db_state.txs.forEach(t => {
        if(t.type=='income') total_available += parseFloat(t.amount);
        else {
            total_available -= parseFloat(t.amount);
            let p = t.date.split('-');
            if(p[1]-1 == m && p[0] == y) {
                this_mo_exp += parseFloat(t.amount);
                if(t.category == 'Food' || t.title.toLowerCase().includes('zomato') || t.title.toLowerCase().includes('swiggy')) {
                    zomato_tax += parseFloat(t.amount);
                }
            }
        }
    });

    var msgs = [];
    if(total_available < 0) msgs.push({c:'danger', t:'Overdrawn', p:'You are literally out of money and in the negative.'});
    else if(total_available < 500) msgs.push({c:'warning', t:'Low Funds', p:'Your total available cash pool is getting dangerously low.'});
    
    if(zomato_tax > 0) {
        msgs.push({c:'warning', t:'Junk Food Alert', p:`You spent ${db_state.prof.curr}${zomato_tax.toFixed(2)} on outside food this month. Start cooking.`});
    }

    if(msgs.length==0 && this_mo_exp>0) msgs.push({c:'success', t:'Looking Good', p:'Finances are stable and you are staying positive.'});
    if(msgs.length==0) { wrap.innerHTML = '<p class="empty-state-small">Need more data to analyze.</p>'; return; }
    
    var html = '';
    for(var k=0; k<msgs.length; k++) {
        html += `<div class="card insight-card ${msgs[k].c}"><h4>${msgs[k].t}</h4><p>${msgs[k].p}</p></div>`;
    }
    wrap.innerHTML = html;
}

function drawPie() {
    var can = document.getElementById('categoryChart');
    if(!can) return;
    var ctx = can.getContext('2d');
    ctx.clearRect(0,0,can.width,can.height);
    
    var m = new Date().getMonth(); var y = new Date().getFullYear();
    var cats = {}; var t_exp = 0;
    
    for(let i=0; i<db_state.txs.length; i++) {
        let t = db_state.txs[i];
        let p = t.date.split('-');
        if(p[1]-1 == m && p[0] == y && t.type=='expense') {
            if(!cats[t.category]) cats[t.category] = 0;
            cats[t.category] += parseFloat(t.amount);
            t_exp += parseFloat(t.amount);
        }
    }
    
    var arr = Object.keys(cats).map(function(k){ return {n:k, v:cats[k]}; });
    arr.sort(function(a,b){ return b.v - a.v; });
    
    if(arr.length==0) {
        ctx.fillStyle = '#8AAB9E'; ctx.fillText("No data", 10, 20);
        document.getElementById('velocity-stats').innerHTML = '';
        return;
    }
    
    var max = arr[0].v;
    var w = (can.width / arr.length) - 10;
    
    for(let i=0; i<arr.length; i++) {
        var h = (arr[i].v / max) * (can.height - 40);
        ctx.fillStyle = '#00C896';
        ctx.fillRect(i*(w+10)+5, can.height - 30 - h, w, h);
        ctx.fillStyle = '#E0F2EC';
        ctx.font = '10px Arial';
        ctx.fillText(arr[i].n.substring(0,5), i*(w+10)+5, can.height - 10);
    }
    
    var v = t_exp / new Date().getDate();
    document.getElementById('velocity-stats').innerHTML = `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding:8px 0;">
            <span>Daily Burn</span><strong>${db_state.prof.curr}${v.toFixed(2)}/day</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0;">
            <span>Top Category</span><strong>${arr[0].n} (${db_state.prof.curr}${arr[0].v.toFixed(2)})</strong>
        </div>
    `;
}

function setupAllTheEvents() {
    if(isSetupDone) { forceUIUpdate(); return; }
    
    var navs = document.querySelectorAll('.nav-item');
    for(var i=0; i<navs.length; i++) {
        navs[i].onclick = function() {
            if(this.id == 'btn-logout') {
                document.getElementById('secure-app-wrapper').style.visibility = 'hidden';
                document.getElementById('login-overlay').classList.add('active');
                document.getElementById('auth-form').classList.remove('hidden');
                document.getElementById('setup-form').classList.add('hidden');
                return;
            }
            
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            var trg = this.getAttribute('data-target');
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById('view-' + trg).classList.add('active');
            
            if(window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
            document.getElementById('afford-result').classList.add('hidden');
            
            if(trg == 'insights') buildInsights();
            if(trg == 'analytics') drawPie();
            if(trg == 'goals') buildGoalsUI();
        }
    }

    document.getElementById('toggle-sidebar').onclick = function() {
        if(window.innerWidth <= 768) document.getElementById('sidebar').classList.toggle('open');
        else document.getElementById('sidebar').classList.toggle('collapsed');
    };

    window.addEventListener('keydown', function(e) {
        if(e.key == 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        }
    });

    var todayStr = new Date().toISOString().split('T')[0];
    
    function openExp() {
        document.getElementById('expense-form').reset();
        document.getElementById('exp-date').value = todayStr;
        document.getElementById('expense-modal').classList.add('active');
    }
    var headBtn = document.getElementById('btn-add-expense-header');
    if(headBtn) headBtn.onclick = openExp;
    document.getElementById('btn-add-expense-main').onclick = openExp;

    function openFund() {
        document.getElementById('funds-form').reset();
        document.getElementById('fund-date').value = todayStr;
        document.getElementById('funds-modal').classList.add('active');
    }
    document.getElementById('btn-add-funds').onclick = openFund;
    document.getElementById('btn-add-funds-main').onclick = openFund;

    document.getElementById('btn-add-goal').onclick = function() {
        document.getElementById('goal-form').reset();
        var d = new Date(); d.setMonth(d.getMonth()+1);
        document.getElementById('goal-deadline').value = d.toISOString().split('T')[0];
        document.getElementById('goal-modal').classList.add('active');
    };

    document.querySelectorAll('.close-modal').forEach(b => {
        b.onclick = function() { this.closest('.modal-overlay').classList.remove('active'); }
    });

    document.getElementById('expense-form').onsubmit = function(e) {
        e.preventDefault();
        var amt = parseFloat(document.getElementById('exp-amount').value);
        if(isNaN(amt) || amt <= 0) return showMsg("Bad amount", "error");
        
        var total_bal = parseFloat(db_state.prof.budget_base) || 0;
        db_state.txs.forEach(t => {
            if(t.type=='income') total_bal += parseFloat(t.amount);
            else total_bal -= parseFloat(t.amount);
        });
        
        if(amt > total_bal) { return showMsg("You broke! Can't add this.", "error"); }

        db_state.txs.unshift({
            id: 'x_' + Math.random().toString(36).substr(2) + Date.now(),
            title: document.getElementById('exp-title').value.replace(/[<>]/g, ""),
            amount: parseFloat(amt.toFixed(2)),
            category: document.getElementById('exp-category').value,
            date: document.getElementById('exp-date').value,
            notes: document.getElementById('exp-notes').value.replace(/[<>]/g, ""),
            type: 'expense'
        });
        db_state.txs.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
        localStorage.setItem(ST_KEY, JSON.stringify(db_state));
        document.getElementById('expense-modal').classList.remove('active');
        showMsg("Expense logged.");
        forceUIUpdate();
    };

    document.getElementById('funds-form').onsubmit = function(e) {
        e.preventDefault();
        var a = parseFloat(document.getElementById('fund-amount').value);
        if(isNaN(a) || a<=0) return;
        db_state.txs.unshift({
            id: 'y_' + Math.random().toString(36).substr(2) + Date.now(),
            title: document.getElementById('fund-title').value.replace(/[<>]/g, ""),
            amount: parseFloat(a.toFixed(2)), category: 'Income', type: 'income', notes:'',
            date: document.getElementById('fund-date').value
        });
        db_state.txs.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
        localStorage.setItem(ST_KEY, JSON.stringify(db_state));
        document.getElementById('funds-modal').classList.remove('active');
        showMsg("Money added!");
        forceUIUpdate();
    };

    document.getElementById('goal-form').onsubmit = function(e) {
        e.preventDefault();
        var n = document.getElementById('goal-name').value.replace(/[<>]/g, "");
        var t = parseFloat(document.getElementById('goal-target').value);
        var c = parseFloat(document.getElementById('goal-current').value);
        if(c > t) { showMsg("Current > Target? Weird.", "error"); return; }
        
        db_state.gls.push({
            id: 'g_' + Date.now(), name: n, target: parseFloat(t.toFixed(2)), current: parseFloat(c.toFixed(2)), deadline: document.getElementById('goal-deadline').value
        });
        localStorage.setItem(ST_KEY, JSON.stringify(db_state));
        document.getElementById('goal-modal').classList.remove('active');
        buildGoalsUI();
    };

     // Handles adding funds to an existing goal
    document.getElementById('fund-goal-form').onsubmit = function(e) {
        e.preventDefault();
        var id = document.getElementById('fg-id').value;
        var amt = parseFloat(document.getElementById('fg-amount').value);
       
        var goalIndex = db_state.gls.findIndex(g => g.id === id);
        if(goalIndex === -1) return showMsg("Goal not found", "error");
       
        var goal = db_state.gls[goalIndex];
        var remaining = goal.target - goal.current;
       
        // Strict Validation: Prevent overfunding
        if (amt > remaining) {
            return showMsg(`Too high! You only need to add ${db_state.prof.curr}${remaining.toFixed(2)} to achieve this goal.`, "warning");
        }
       
        // Add the funds and save
        db_state.gls[goalIndex].current += amt;
        localStorage.setItem(ST_KEY, JSON.stringify(db_state));
        document.getElementById('fund-goal-modal').classList.remove('active');
       
        // Custom message if they just hit 100%
        if (amt === remaining) {
            showMsg("Congratulations! Goal Achieved!", "success");
        } else {
            showMsg("Funds added to goal!", "success");
        }
       
        buildGoalsUI();
    };

    document.getElementById('settings-form').onsubmit = function(e) {
        e.preventDefault();
        db_state.prof.n = document.getElementById('set-name').value.replace(/[<>]/g,"");
        db_state.prof.curr = document.getElementById('set-currency').value.replace(/[<>]/g,"");
        var np = document.getElementById('set-pin').value;
        if(np && np.length==4) db_state.prof.pHash = doHash(np);
        localStorage.setItem(ST_KEY, JSON.stringify(db_state));
        showMsg("Saved");
        document.getElementById('set-pin').value = '';
        forceUIUpdate();
    };

    document.getElementById('afford-form').onsubmit = function(e) {
        e.preventDefault();
        var item_name = document.getElementById('afford-name').value.replace(/[<>]/g, ""); 
        var cost = parseFloat(document.getElementById('afford-price').value);
        var res = document.getElementById('afford-result');
        
        var m = new Date().getMonth();
        var y = new Date().getFullYear();
        
        // Exact real-time all-time balance logic
        var bal = parseFloat(db_state.prof.budget_base) || 0;
        db_state.txs.forEach(t => {
            if(t.type=='income') bal += parseFloat(t.amount);
            else bal -= parseFloat(t.amount);
        });
        
        var today = new Date();
        var days_in_mo = new Date(y, m+1, 0).getDate();
        var left_days = days_in_mo - today.getDate() + 1;
        if(left_days < 1) left_days = 1; 
        
        var old_pace = bal / left_days;
        var new_pace = (bal - cost) / left_days;
        var drop_amt = old_pace - new_pace;
        var c_sym = db_state.prof.curr;
        
        res.className = 'card afford-result';
        
        var title = "";
        var desc = "";
        var math_html = "";
        
        if(cost > bal) {
            res.classList.add('bg-red');
            title = "<h3>Nope</h3>";
            desc = "<p>You literally don't have enough money for <b>" + item_name + "</b> right now.</p>";
        } else {
            if(new_pace < (old_pace * 0.5)) {
                res.classList.add('bg-yellow');
                title = "<h3>Risky Purchase</h3>";
                desc = "<p>Buying <b>" + item_name + "</b> will cut your daily allowance by more than half. Survive on Maggi?</p>";
            } else {
                res.classList.add('bg-green');
                title = "<h3>Go For It</h3>";
                desc = "<p>You can buy <b>" + item_name + "</b> and still survive the month.</p>";
            }

            math_html = `
                <div class="math-breakdown" style="margin-top: 15px; padding: 15px; background: var(--bg-dark); border: 1px dashed var(--border-color); border-radius: 8px; text-align: left; font-family: monospace; font-size: 0.9rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                        <span>Current Limit:</span>
                        <strong>${c_sym}${old_pace.toFixed(2)} / day</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom: 8px; color: var(--danger);">
                        <span>Cost of ${item_name}:</span>
                        <strong>- ${c_sym}${cost.toFixed(2)}</strong>
                    </div>
                    <hr style="border:0; border-top: 1px dashed var(--border-color); margin: 10px 0;">
                    <div style="display:flex; justify-content:space-between; color: var(--emerald);">
                        <span>New Daily Limit:</span>
                        <strong>${c_sym}${new_pace.toFixed(2)} / day</strong>
                    </div>
                    <div style="text-align: right; font-size: 0.8rem; color: var(--text-muted); margin-top: 5px;">
                        (Drops by ${c_sym}${drop_amt.toFixed(2)} per day for the next ${left_days} days)
                    </div>
                </div>
            `;
        }
        
        res.innerHTML = title + desc + math_html;
        res.classList.remove('hidden');
    };

    // JSON Export/Import
    document.getElementById('btn-export').onclick = function(){
        var b = new Blob([JSON.stringify(db_state, null, 2)], {type:"application/json"});
        var a = document.createElement('a'); a.href = URL.createObjectURL(b);
        a.download = "SpendWise_Backup.json"; a.click();
        URL.revokeObjectURL(a.href);
    };

    document.getElementById('btn-trigger-import').onclick = function(){ document.getElementById('file-import').click(); };
    document.getElementById('file-import').onchange = function(e) {
        var r = new FileReader();
        r.onload = function(ev) {
            try {
                var test = JSON.parse(ev.target.result);
                if(test.prof && test.txs) {
                    db_state = test;
                    localStorage.setItem(ST_KEY, JSON.stringify(db_state));
                    location.reload();
                } else {
                    showMsg("Invalid file format", "error");
                }
            } catch(err) { showMsg("Bad file", "error"); }
        };
        r.readAsText(e.target.files[0]);
    };

        // --- NEW: CSV Export ---
    document.getElementById('btn-export-csv').onclick = function() {
        if (!db_state.txs.length) return showMsg("No data to export", "error");
        var csv = "ID,Type,Title,Amount,Category,Date,Notes\n";
        db_state.txs.forEach(function(t) {
            csv += `${t.id},${t.type},"${t.title}",${t.amount},${t.category},${t.date},"${t.notes || ''}"\n`;
        });
        var b = new Blob([csv], {type:"text/csv;charset=utf-8;"});
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = "SpendWise_Transactions.csv";
       
        // Fix: Append to body before clicking so the browser allows the download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
       
        URL.revokeObjectURL(a.href);
    };

    // --- NEW: CSV Import ---
    document.getElementById('btn-trigger-import-csv').onclick = function(){ document.getElementById('file-import-csv').click(); };
    
    document.getElementById('file-import-csv').onchange = function(e) {
        var r = new FileReader();
        r.onload = function(ev) {
            var lines = ev.target.result.split('\n');
            var imported = 0;
            for (var i = 1; i < lines.length; i++) {
                var line = lines[i].trim();
                if (!line) continue;
                // Parse CSV ignoring commas inside quotes
                var p = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, ''));
                if (p.length >= 6) {
                    // Check ID to prevent duplicating existing imports
                    if (!db_state.txs.find(x => x.id == p[0])) {
                        db_state.txs.push({
                            id: p[0], type: p[1], title: p[2], amount: parseFloat(p[3]), 
                            category: p[4], date: p[5], notes: p[6] || ''
                        });
                        imported++;
                    }
                }
            }
            if(imported > 0) {
                db_state.txs.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
                localStorage.setItem(ST_KEY, JSON.stringify(db_state));
                showMsg(imported + " records imported!", "success");
                forceUIUpdate();
            } else {
                showMsg("No new records found.", "warning");
            }
        };
        r.readAsText(e.target.files[0]);
    };

    document.getElementById('btn-reset').onclick = function(){
        if(confirm("WIPE EVERYTHING?")) { localStorage.removeItem(ST_KEY); location.reload(); }
    };
    
    document.getElementById('btn-view-all').onclick = function(){ document.querySelector('[data-target="transactions"]').click(); };

    document.getElementById('finance-tip-text').innerText = getTip();
    isSetupDone = true;
    forceUIUpdate();
}

window.onload = function() {
    var raw = localStorage.getItem(ST_KEY);
    if(raw) {
        db_state = JSON.parse(raw);
        if(!db_state.gls) db_state.gls = []; 
    } else {
        db_state = { v: '2.1', prof: {n: '', budget_base: 0, curr: '₹', pHash: ''}, txs: [], gls: [] };
    }
    startAppFlow();
};