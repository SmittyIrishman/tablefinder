import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const GAMES = {
  ttrpg: ["D&D 5e","Pathfinder 2e","Call of Cthulhu","Vampire: the Masquerade","Shadowrun","Blades in the Dark","Mothership","OSR/Old School","Traveller 2E","Star Wars RPG","Cyberpunk RED","Dungeon World","Savage Worlds","GURPS","Delta Green","Forbidden Lands"],
  tcg: ["Magic: the Gathering","Pokémon TCG","Yu-Gi-Oh!","Flesh and Blood","Star Wars Unlimited","Lorcana","One Piece TCG","Digimon TCG","Altered TCG","Arkham Horror LCG","Marvel Champions LCG"],
  wargames: ["Warhammer 40K","Warhammer Age of Sigmar","Horus Heresy","Kill Team","Warcry","Star Wars: Legion","Bolt Action","Flames of War","Infinity","Kings of War","One Page Rules","Battletech"],
};
const EXPERIENCE = ["New Player","Casual","Intermediate","Competitive","Game Master / Judge"];

function AvatarEl({ emoji, size = "md", online }: { emoji: string; size?: string; online?: boolean }) {
  const sizes: Record<string, string> = { sm:"w-8 h-8 text-lg", md:"w-12 h-12 text-2xl", lg:"w-16 h-16 text-3xl" };
  return (
    <div className="relative inline-block flex-shrink-0">
      <div className={`${sizes[size]} rounded-full bg-amber-900 flex items-center justify-center border-2 border-amber-600`}>{emoji}</div>
      {online !== undefined && <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-stone-900 ${online ? "bg-green-400" : "bg-stone-500"}`} />}
    </div>
  );
}

function GameTag({ game }: { game: string }) {
  const isWargame = GAMES.wargames.includes(game);
  const isTCG = GAMES.tcg.includes(game);
  const style = isWargame ? "bg-red-900 text-red-200" : isTCG ? "bg-blue-900 text-blue-200" : "bg-amber-900 text-amber-200";
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${style}`}>{game}</span>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-stone-700">
          <h2 className="text-lg font-bold text-amber-200" style={{fontFamily:"'Palatino Linotype',Palatino,serif"}}>{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-white text-2xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-4xl animate-spin">⚙️</div>
      <span className="ml-3 text-stone-400">Loading...</span>
    </div>
  );
}

// ── Auth Screen ────────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }: { onAuth: (user: any) => void }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setMessage("Password reset email sent! Check your inbox.");
      setLoading(false);
      return;
    }
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else { setMessage("Account created! You are now signed in."); onAuth(data.user); }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onAuth(data.user);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4" style={{fontFamily:"'Georgia',serif"}}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-300 mb-2" style={{fontFamily:"'Palatino Linotype',Palatino,serif"}}>⚔️ TableFinder</h1>
          <p className="text-stone-400">Find your adventuring party</p>
        </div>
        <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6">
          {mode !== "reset" && (
            <div className="flex mb-6 bg-stone-800 rounded-lg p-1">
              <button onClick={() => { setMode("signin"); setError(null); setMessage(null); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode==="signin" ? "bg-amber-700 text-white" : "text-stone-400 hover:text-white"}`}>Sign In</button>
              <button onClick={() => { setMode("signup"); setError(null); setMessage(null); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode==="signup" ? "bg-amber-700 text-white" : "text-stone-400 hover:text-white"}`}>Create Account</button>
            </div>
          )}
          {mode === "reset" && (
            <div className="mb-6">
              <h2 className="text-amber-200 font-bold mb-1">Reset Password</h2>
              <p className="text-stone-400 text-sm">Enter your email and we'll send you a reset link.</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-stone-400 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" placeholder="you@example.com" />
            </div>
            {mode !== "reset" && (
              <div>
                <label className="block text-sm text-stone-400 mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" placeholder="Minimum 6 characters" />
              </div>
            )}
            {error && <div className="bg-red-900/40 border border-red-700 rounded-lg px-3 py-2 text-red-300 text-sm">{error}</div>}
            {message && <div className="bg-green-900/40 border border-green-700 rounded-lg px-3 py-2 text-green-300 text-sm">{message}</div>}
            {mode === "signup" && (
              <div className="flex items-start gap-3">
                <input type="checkbox" id="ageConfirm" checked={ageConfirmed} onChange={e => setAgeConfirmed(e.target.checked)} className="mt-1 accent-amber-500 w-4 h-4 flex-shrink-0" />
                <label htmlFor="ageConfirm" className="text-sm text-stone-400 cursor-pointer">I confirm that I am <span className="text-amber-300 font-medium">18 years of age or older</span></label>
              </div>
            )}
            <button onClick={handleSubmit} disabled={!email || (!password && mode !== "reset") || loading || (mode === "signup" && !ageConfirmed)}
              className="w-full py-3 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors">
              {loading ? "Please wait..." : mode === "reset" ? "Send Reset Email" : mode === "signup" ? "Create Account →" : "Sign In →"}
            </button>
            {mode === "signin" && (
              <button onClick={() => { setMode("reset"); setError(null); setMessage(null); }} className="w-full text-center text-sm text-stone-500 hover:text-stone-300 transition-colors">Forgot your password?</button>
            )}
            {mode === "reset" && (
              <button onClick={() => { setMode("signin"); setError(null); setMessage(null); }} className="w-full text-center text-sm text-stone-500 hover:text-stone-300 transition-colors">← Back to Sign In</button>
            )}
          </div>
        </div>
        <p className="text-center text-stone-600 text-xs mt-4">Your data is stored securely and never shared.</p>
      </div>
    </div>
  );
}

// ── Profile Setup ──────────────────────────────────────────────────────────────
function ProfileSetup({ existing, onSave }: { existing: any; onSave: (form: any) => Promise<void> }) {
  const [form, setForm] = useState(existing || { name:"", city:"", avatar:"🎲", games:[], experience:"Casual", bio:"", date_of_birth:"" });
  const [saving, setSaving] = useState(false);
  const AVATARS = ["🎲","🧙","⚔️","🐉","🃏","🎭","🦇","🌟","🐙","🔮","⚡","🛡️","🗡️","🏹","🎯","🧌"];
  const toggle = (game: string) => setForm((f: any) => ({...f, games: f.games.includes(game) ? f.games.filter((g: string) => g !== game) : [...f.games, game]}));

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = new Date(e.target.value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const isUnder18 = age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate());
    if (isUnder18) alert("You must be 18 or older to use TableFinder.");
    else setForm((f: any) => ({...f, date_of_birth: e.target.value}));
  };

  const handleSave = async () => {
    if (!form.name || !form.city || !form.games.length || !form.date_of_birth) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const gameSections: [string, string, string][] = [["TTRPGs","ttrpg","amber"],["TCGs","tcg","blue"],["Wargames & Miniatures","wargames","red"]];

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm text-stone-400 mb-2">Choose your avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map(a => (
            <button key={a} onClick={() => setForm((f: any) => ({...f,avatar:a}))}
              className={`text-2xl w-10 h-10 rounded-lg transition-all ${form.avatar===a ? "bg-amber-700 ring-2 ring-amber-400" : "bg-stone-800 hover:bg-stone-700"}`}>{a}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-stone-400 mb-1">Display Name *</label>
          <input value={form.name} onChange={e => setForm((f: any) => ({...f,name:e.target.value}))}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" placeholder="e.g. Alex V." />
        </div>
        <div>
          <label className="block text-sm text-stone-400 mb-1">City / Region *</label>
          <input value={form.city} onChange={e => setForm((f: any) => ({...f,city:e.target.value}))}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" placeholder="e.g. Austin, TX" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-stone-400 mb-1">Date of Birth * <span className="text-stone-500">(must be 18+)</span></label>
        <input type="date" value={form.date_of_birth || ""} onChange={handleDobChange}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm text-stone-400 mb-1">Experience Level</label>
        <select value={form.experience} onChange={e => setForm((f: any) => ({...f,experience:e.target.value}))}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none">
          {EXPERIENCE.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-stone-400 mb-2">Games You Play *</label>
        {gameSections.map(([label, key, color]) => (
          <div key={key} className="mb-3">
            <p className="text-xs text-stone-500 mb-1.5">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {GAMES[key as keyof typeof GAMES].map(g => (
                <button key={g} onClick={() => toggle(g)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${form.games.includes(g)
                    ? color === "amber" ? "bg-amber-800 border-amber-600 text-amber-100"
                    : color === "blue" ? "bg-blue-800 border-blue-600 text-blue-100"
                    : "bg-red-800 border-red-600 text-red-100"
                    : "border-stone-600 text-stone-400 hover:border-stone-400"}`}>{g}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm text-stone-400 mb-1">Bio</label>
        <textarea value={form.bio} onChange={e => setForm((f: any) => ({...f,bio:e.target.value}))} rows={3}
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none resize-none"
          placeholder="Tell others what kind of player you are..." />
      </div>
      <button onClick={handleSave} disabled={!form.name || !form.city || !form.games.length || !form.date_of_birth || saving}
        className="w-full py-3 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors">
        {saving ? "Saving..." : "Save Profile →"}
      </button>
    </div>
  );
}

// ── Players Tab ────────────────────────────────────────────────────────────────
function PlayersTab({ myProfile, onMessage }: { myProfile: any; onMessage: (p: any) => void }) {
  const [players, setPlayers] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, number[]>>({});
  const [myRatings, setMyRatings] = useState<Record<string, number>>({});
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reportTarget, setReportTarget] = useState<any>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSaving, setReportSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: playerData } = await supabase.from("players").select("*").order("created_at", { ascending: false });
      setPlayers(playerData || []);
      const { data: ratingData } = await supabase.from("ratings").select("*");
      if (ratingData) {
        const averages: Record<string, number[]> = {};
        const mine: Record<string, number> = {};
        ratingData.forEach((r: any) => {
          if (!averages[r.player_id]) averages[r.player_id] = [];
          averages[r.player_id].push(r.score);
          if (myProfile && r.rater_id === myProfile.id) mine[r.player_id] = r.score;
        });
        setRatings(averages);
        setMyRatings(mine);
      }
      if (myProfile) {
        const { data: blockData } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", myProfile.id);
        setBlockedIds((blockData || []).map((b: any) => b.blocked_id));
      }
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [myProfile]);

  const ratePlayer = async (playerId: string, score: number) => {
    if (!myProfile) return;
    await supabase.from("ratings").upsert({ player_id: playerId, rater_id: myProfile.id, score }, { onConflict: "player_id,rater_id" });
    setMyRatings(r => ({...r, [playerId]: score}));
  };

  const blockPlayer = async (playerId: string) => {
    if (!myProfile) return;
    const isBlocked = blockedIds.includes(playerId);
    if (isBlocked) {
      await supabase.from("blocks").delete().eq("blocker_id", myProfile.id).eq("blocked_id", playerId);
      setBlockedIds(ids => ids.filter(id => id !== playerId));
    } else {
      await supabase.from("blocks").insert([{ blocker_id: myProfile.id, blocked_id: playerId }]);
      setBlockedIds(ids => [...ids, playerId]);
    }
  };

  const submitReport = async () => {
    if (!myProfile || !reportTarget || !reportReason) return;
    setReportSaving(true);
    await supabase.from("reports").insert([{
      reporter_id: myProfile.id, reported_id: reportTarget.id,
      reason: reportReason, details: reportDetails, status: "pending"
    }]);
    await supabase.functions.invoke("report-notification", {
      body: { reporterName: myProfile.name, reportedName: reportTarget.name, reportedEmail: null, reason: reportReason, details: reportDetails }
    });
    setReportTarget(null);
    setReportReason("");
    setReportDetails("");
    setReportSaving(false);
    alert("Report submitted. Thank you for helping keep TableFinder safe.");
  };

  const getAverage = (playerId: string) => {
    const r = ratings[playerId];
    if (!r || r.length === 0) return null;
    return (r.reduce((a, b) => a + b, 0) / r.length).toFixed(1);
  };

  const filtered = players
    .filter(p => p.user_id !== myProfile?.user_id)
    .filter(p => !blockedIds.includes(p.id))
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.games?.some((g: string) => g.toLowerCase().includes(search.toLowerCase())));

  if (loading) return <LoadingSpinner />;

  const REPORT_REASONS = ["Harassment","Inappropriate behavior","Spam","Underage user","Other"];

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-white text-sm focus:border-amber-500 outline-none"
        placeholder="🔍 Search players or games..." />
      {filtered.length === 0 && (
        <div className="text-center text-stone-500 py-16">
          <div className="text-4xl mb-3">👥</div>
          <p>No other players yet.</p>
          <p className="text-sm mt-1">Invite friends to join!</p>
        </div>
      )}
      <div className="space-y-3">
        {filtered.map(p => {
          const avg = getAverage(p.id);
          const myScore = myRatings[p.id] || 0;
          return (
            <div key={p.id} className="bg-stone-800 border border-stone-700 rounded-xl p-4 hover:border-amber-700 transition-colors">
              <div className="flex items-start gap-3">
                <AvatarEl emoji={p.avatar} online={p.online} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-amber-100">{p.name}</span>
                    <span className="text-xs text-stone-500">{p.experience}</span>
                  </div>
                  <p className="text-xs text-stone-400 mb-2">📍 {p.city}</p>
                  <div className="flex flex-wrap gap-1 mb-2">{p.games?.map((g: string) => <GameTag key={g} game={g} />)}</div>
                  {p.bio && <p className="text-xs text-stone-400 italic mb-2">"{p.bio}"</p>}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => myProfile && ratePlayer(p.id, n)}
                          className={`text-lg transition-transform hover:scale-125 ${myProfile ? "cursor-pointer" : "cursor-default"} ${myScore >= n ? "opacity-100" : "opacity-30"}`}>🎲</button>
                      ))}
                    </div>
                    {avg ? <span className="text-xs text-amber-400">{avg} avg ({ratings[p.id]?.length} {ratings[p.id]?.length === 1 ? "rating" : "ratings"})</span>
                      : <span className="text-xs text-stone-500">No ratings yet</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => onMessage(p)} className="text-xs px-3 py-1.5 bg-stone-700 hover:bg-amber-800 text-stone-200 rounded-lg transition-colors whitespace-nowrap">Message</button>
                  <button onClick={() => blockPlayer(p.id)} className="text-xs px-3 py-1.5 bg-stone-700 hover:bg-red-900 text-stone-400 hover:text-red-300 rounded-lg transition-colors whitespace-nowrap">
                    {blockedIds.includes(p.id) ? "Unblock" : "Block"}
                  </button>
                  <button onClick={() => setReportTarget(p)} className="text-xs px-3 py-1.5 bg-stone-700 hover:bg-orange-900 text-stone-400 hover:text-orange-300 rounded-lg transition-colors whitespace-nowrap">Report</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {reportTarget && (
        <Modal title={`Report ${reportTarget.name}`} onClose={() => setReportTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-stone-400">Help keep TableFinder safe by reporting players who violate our community standards.</p>
            <div>
              <label className="block text-sm text-stone-400 mb-2">Reason *</label>
              <div className="flex flex-wrap gap-2">
                {REPORT_REASONS.map(r => (
                  <button key={r} onClick={() => setReportReason(r)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${reportReason === r ? "bg-red-900 border-red-600 text-red-100" : "border-stone-600 text-stone-400 hover:border-stone-400"}`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-1">Additional details</label>
              <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} rows={3}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none resize-none"
                placeholder="Describe what happened..." />
            </div>
            <p className="text-xs text-stone-500">Your report is anonymous. Our team will review it and take appropriate action.</p>
            <button onClick={submitReport} disabled={!reportReason || reportSaving}
              className="w-full py-3 bg-red-800 hover:bg-red-700 disabled:opacity-40 text-white font-bold rounded-lg transition-colors">
              {reportSaving ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Events Tab ─────────────────────────────────────────────────────────────────
function EventsTab({ myProfile }: { myProfile: any }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title:"", date:"", time:"", location:"", games:[] as string[], max_players:6, description:"" });

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from("events").select("*").order("date", { ascending: true });
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  const joinEvent = async (event: any) => {
    if (!myProfile) return;
    const joined = event.joined || [];
    const alreadyJoined = joined.includes(myProfile.id);
    const updated = alreadyJoined ? joined.filter((id: string) => id !== myProfile.id) : [...joined, myProfile.id];
    await supabase.from("events").update({ joined: updated }).eq("id", event.id);
    setEvents(evs => evs.map(e => e.id === event.id ? {...e, joined: updated} : e));
  };

  const createEvent = async () => {
    if (!form.title || !form.date || !myProfile) return;
    setSaving(true);
    const { data } = await supabase.from("events").insert([{ ...form, host: myProfile.name, joined: [] }]).select();
    if (data) setEvents(evs => [...evs, data[0]]);
    setShowCreate(false);
    setForm({ title:"", date:"", time:"", location:"", games:[], max_players:6, description:"" });
    setSaving(false);
  };

  const toggleGame = (game: string) => setForm(f => ({...f, games: f.games.includes(game) ? f.games.filter(g => g !== game) : [...f.games, game]}));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <button onClick={() => setShowCreate(true)}
        className="w-full mb-4 py-3 border-2 border-dashed border-stone-600 hover:border-amber-600 text-stone-400 hover:text-amber-400 rounded-xl transition-colors text-sm font-medium">
        + Host a New Event
      </button>
      {events.length === 0 && (
        <div className="text-center text-stone-500 py-16">
          <div className="text-4xl mb-3">📅</div>
          <p>No events yet — be the first to host one!</p>
        </div>
      )}
      <div className="space-y-3">
        {events.map(e => {
          const spotsLeft = e.max_players - (e.joined?.length || 0);
          const joined = myProfile && e.joined?.includes(myProfile.id);
          return (
            <div key={e.id} className="bg-stone-800 border border-stone-700 rounded-xl p-4 hover:border-amber-700 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-100 mb-1">{e.title}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">{e.games?.map((g: string) => <GameTag key={g} game={g} />)}</div>
                  <p className="text-xs text-stone-400">📅 {e.date}{e.time && ` • ${e.time}`}</p>
                  <p className="text-xs text-stone-400">📍 {e.location}</p>
                  <p className="text-xs text-stone-400">👤 Hosted by {e.host}</p>
                  {e.description && <p className="text-xs text-stone-500 mt-2 italic">{e.description}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs mb-2 font-medium ${spotsLeft===0?"text-red-400":spotsLeft<=2?"text-yellow-400":"text-green-400"}`}>
                    {spotsLeft===0?"Full":`${spotsLeft} spot${spotsLeft!==1?"s":""} left`}
                  </div>
                  <button onClick={() => joinEvent(e)} disabled={spotsLeft===0&&!joined}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${joined?"bg-amber-800 text-amber-200 hover:bg-red-900 hover:text-red-200":"bg-amber-700 hover:bg-amber-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"}`}>
                    {joined ? "Leave" : "Join"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {showCreate && (
        <Modal title="Host a New Event" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-stone-400 mb-1">Event Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({...f,title:e.target.value}))}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" placeholder="e.g. D&D One-Shot: The Lost Vault" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-stone-400 mb-1">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({...f,date:e.target.value}))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-stone-400 mb-1">Time</label>
                <input value={form.time} onChange={e => setForm(f => ({...f,time:e.target.value}))}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" placeholder="e.g. 6:00 PM" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-1">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({...f,location:e.target.value}))}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none" placeholder="Address or 'Online (Discord)'" />
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-2">Games</label>
              <div className="flex flex-wrap gap-1.5">
                {[...GAMES.ttrpg,...GAMES.tcg,...GAMES.wargames].map(g => (
                  <button key={g} onClick={() => toggleGame(g)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.games.includes(g)?"bg-amber-800 border-amber-600 text-amber-100":"border-stone-600 text-stone-400 hover:border-stone-400"}`}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-1">Max Players: {form.max_players}</label>
              <input type="range" min={2} max={20} value={form.max_players} onChange={e => setForm(f => ({...f,max_players:+e.target.value}))} className="w-full accent-amber-500" />
            </div>
            <div>
              <label className="block text-sm text-stone-400 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} rows={3}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none resize-none"
                placeholder="Describe the event, experience requirements, etc." />
            </div>
            <button onClick={createEvent} disabled={!form.title||!form.date||saving}
              className="w-full py-3 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white font-bold rounded-lg transition-colors">
              {saving ? "Creating..." : "Create Event"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Matchmaking Tab ────────────────────────────────────────────────────────────
function MatchmakingTab({ myProfile }: { myProfile: any }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("players").select("*").then(({ data }) => setAllPlayers(data || []));
  }, []);

  const findMatches = async () => {
    if (!myProfile) return;
    setLoading(true);
    setError(null);
    const others = allPlayers.filter(p => p.user_id !== myProfile.user_id);
    const prompt = `You are a tabletop gaming matchmaker. A player named ${myProfile.name} is looking for others to play with.
Their profile:
- Games: ${myProfile.games?.join(", ")}
- Experience: ${myProfile.experience}
- City: ${myProfile.city}
- Bio: ${myProfile.bio || "None provided"}
Other available players:
${others.map((p: any) => `- ${p.name} (${p.experience}): plays ${p.games?.join(", ")}. Bio: ${p.bio||"N/A"}`).join("\n")}
Return a JSON array of the top 3 best player matches. For each match include: name (string), reason (1-2 sentence explanation), compatibility (number 1-100), sharedGames (array of shared game names). Return ONLY the JSON array, no markdown.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] })
      });
      const data = await res.json();
      const text = data.content?.map((c: any) => c.text||"").join("").replace(/```json|```/g,"").trim();
      setMatches(JSON.parse(text));
    } catch {
      setError("Couldn't reach the matchmaking oracle. Try again!");
    }
    setLoading(false);
  };

  if (!myProfile) return (
    <div className="text-center py-16 text-stone-400">
      <div className="text-4xl mb-4">🔮</div>
      <p>Set up your profile first to use AI matchmaking.</p>
    </div>
  );

  return (
    <div>
      <div className="bg-stone-800 border border-amber-900 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-amber-200 mb-1" style={{fontFamily:"'Palatino Linotype',Palatino,serif"}}>The Oracle of Compatible Players</h3>
        <p className="text-sm text-stone-400 mb-4">Our AI analyzes game preferences, experience levels, and play styles to find your ideal gaming companions.</p>
        <button onClick={findMatches} disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-white font-bold rounded-lg transition-all disabled:opacity-50">
          {loading ? "⟳ Consulting the Oracle..." : "✦ Find My Best Matches"}
        </button>
        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
      </div>
      {matches && (
        <div className="space-y-3">
          {matches.map((m: any, i: number) => {
            const player = allPlayers.find(p => p.name === m.name);
            return (
              <div key={i} className="bg-stone-800 border border-stone-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  {player && <AvatarEl emoji={player.avatar} online={player.online} />}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-amber-100">{m.name}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-stone-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{width:`${m.compatibility}%`}} />
                        </div>
                        <span className="text-xs text-amber-400 font-medium">{m.compatibility}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-300 mb-2">{m.reason}</p>
                    {m.sharedGames?.length > 0 && <div className="flex flex-wrap gap-1">{m.sharedGames.map((g: string) => <GameTag key={g} game={g} />)}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Messages Tab ───────────────────────────────────────────────────────────────
function MessagesTab({ conversations, setConversations }: { conversations: any[]; setConversations: (c: any) => void }) {
  const [active, setActive] = useState<string|null>(null);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim() || !active) return;
    setConversations((c: any[]) => c.map(cv => cv.id === active ? {...cv, messages: [...cv.messages, {from:"me", text:input, time:"Just now"}]} : cv));
    setInput("");
  };

  const activeConv = conversations.find(c => c.id === active);

  return (
    <div className="flex gap-3 h-96">
      <div className="w-1/3 space-y-1 overflow-y-auto">
        {conversations.length === 0 && <p className="text-stone-500 text-sm text-center py-8">No messages yet.<br/>Message a player from the Players tab!</p>}
        {conversations.map(c => (
          <button key={c.id} onClick={() => setActive(c.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${active===c.id?"bg-amber-900":"bg-stone-800 hover:bg-stone-700"}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{c.avatar}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-amber-100 truncate">{c.name}</p>
                <p className="text-xs text-stone-400 truncate">{c.messages[c.messages.length-1]?.text}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col bg-stone-800 rounded-xl overflow-hidden border border-stone-700">
        {activeConv ? (
          <>
            <div className="p-3 border-b border-stone-700 flex items-center gap-2">
              <span className="text-lg">{activeConv.avatar}</span>
              <span className="font-medium text-amber-100 text-sm">{activeConv.name}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeConv.messages.map((m: any, i: number) => (
                <div key={i} className={`flex ${m.from==="me"?"justify-end":"justify-start"}`}>
                  <div className={`max-w-xs text-xs px-3 py-2 rounded-2xl ${m.from==="me"?"bg-amber-800 text-amber-50":"bg-stone-700 text-stone-100"}`}>
                    <p>{m.text}</p>
                    <p className={`text-xs mt-1 ${m.from==="me"?"text-amber-300":"text-stone-400"}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-stone-700 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&send()}
                className="flex-1 bg-stone-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-amber-500" placeholder="Send a message..." />
              <button onClick={send} className="px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors">→</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-stone-500 text-sm">Select a conversation</div>
        )}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState("players");
  const [showProfile, setShowProfile] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [msgTarget, setMsgTarget] = useState<any>(null);
  const [msgText, setMsgText] = useState("");

useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        loadProfile(session.user.id).finally(() => setAuthLoading(false));
      } else {
        setAuthLoading(false);
      }
    }).catch(() => setAuthLoading(false));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        loadProfile(session.user.id);
      } else {
        setAuthUser(null);
        setMyProfile(null);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setAuthUser(null);
        setMyProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from("players").select("*").eq("user_id", userId).maybeSingle();
      if (data) { setMyProfile(data); setShowProfile(false); }
      else { setMyProfile(null); setShowProfile(true); }
    } catch {
      setShowProfile(false);
    }
  };

  const saveProfile = async (form: any) => {
    if (!authUser) return;
    const profileData = { ...form, user_id: authUser.id, online: true };
    if (myProfile?.id) {
      const { data, error } = await supabase.from("players").update(profileData).eq("id", myProfile.id).select();
      if (error?.code === "23505") return alert("That name is already taken — please choose another!");
      if (data?.[0]) setMyProfile(data[0]);
    } else {
      const { data, error } = await supabase.from("players").insert([profileData]).select();
      if (error?.code === "23505") return alert("That name is already taken — please choose another!");
      if (data?.[0]) setMyProfile(data[0]);
    }
    setShowProfile(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setMyProfile(null);
    setConversations([]);
  };

  const startConversation = (player: any) => {
    const existing = conversations.find(c => c.playerId === player.id);
    if (!existing) {
      setConversations((c: any[]) => [...c, {
        id: `c-${player.id}`, playerId: player.id, name: player.name, avatar: player.avatar,
        messages: [{ from: player.id, text: `Hey! I saw your profile. Want to play ${player.games?.[0]}?`, time: "Just now" }]
      }]);
    }
    setMsgTarget(null);
    setTab("messages");
  };

  const TABS = [
    {id:"players",label:"Players",icon:"👥"},
    {id:"events",label:"Events",icon:"📅"},
    {id:"matchmaking",label:"Match",icon:"🔮"},
    {id:"messages",label:"Messages",icon:"💬"},
  ];

  if (authLoading) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">⚔️</div>
        <p className="text-stone-400">Loading TableFinder...</p>
      </div>
    </div>
  );

  if (!authUser) return <AuthScreen onAuth={setAuthUser} />;

  return (
    <div className="min-h-screen bg-stone-950 text-white" style={{fontFamily:"'Georgia',serif"}}>
      <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur border-b border-stone-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-amber-300" style={{fontFamily:"'Palatino Linotype',Palatino,serif",letterSpacing:"0.02em"}}>⚔️ TableFinder</h1>
            <p className="text-xs text-stone-500">Find your adventuring party</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 px-3 py-2 rounded-lg transition-colors">
              {myProfile ? (<><span>{myProfile.avatar}</span><span className="text-sm text-amber-200">{myProfile.name}</span></>) : <span className="text-sm text-stone-300">Set up Profile</span>}
            </button>
            <button onClick={handleSignOut} className="text-xs text-stone-500 hover:text-stone-300 px-2 py-2 transition-colors">Sign Out</button>
          </div>
        </div>
      </header>
      <div className="sticky top-14 z-30 bg-stone-950/95 backdrop-blur border-b border-stone-800">
        <div className="max-w-2xl mx-auto px-4 flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${tab===t.id?"text-amber-300 border-b-2 border-amber-400":"text-stone-400 hover:text-stone-200"}`}>
              <span className="mr-1">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>
      <main className="max-w-2xl mx-auto px-4 py-5">
        {tab==="players" && <PlayersTab myProfile={myProfile} onMessage={setMsgTarget} />}
        {tab==="events" && <EventsTab myProfile={myProfile} />}
        {tab==="matchmaking" && <MatchmakingTab myProfile={myProfile} />}
        {tab==="messages" && <MessagesTab conversations={conversations} setConversations={setConversations} />}
      </main>
      {showProfile && (
        <Modal title={myProfile ? "Edit Profile" : "Create Your Profile"} onClose={() => setShowProfile(false)}>
          <ProfileSetup existing={myProfile} onSave={saveProfile} />
        </Modal>
      )}
      {msgTarget && (
        <Modal title={`Message ${msgTarget.name}`} onClose={() => setMsgTarget(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-stone-800 rounded-lg p-3">
              <AvatarEl emoji={msgTarget.avatar} online={msgTarget.online} />
              <div>
                <p className="font-medium text-amber-100">{msgTarget.name}</p>
                <div className="flex flex-wrap gap-1 mt-1">{msgTarget.games?.slice(0,3).map((g: string) => <GameTag key={g} game={g} />)}</div>
              </div>
            </div>
            <textarea value={msgText} onChange={e => setMsgText(e.target.value)} rows={4}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 outline-none resize-none"
              placeholder={`Hey ${msgTarget.name}! I saw you play ${msgTarget.games?.[0]}...`} />
            <button onClick={() => { startConversation(msgTarget); setMsgText(""); }}
              className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors">
              Send Message
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
