const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'cadetconnect_db.json');
const DB_TMP_FILE = path.join(DATA_DIR, 'cadetconnect_db.tmp.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class LocalDatabase {
  constructor() {
    this.data = {
      users: [],
      cadet_profiles: [],
      aspirant_profiles: [],
      mentor_profiles: [],
      verification_requests: [],
      connections: [],
      follows: [],
      posts: [],
      comments: [],
      reactions: [],
      reposts: [],
      stories: [],
      notes: [],
      videos: [],
      communities: [],
      community_members: [],
      community_posts: [],
      events: [],
      event_registrations: [],
      mentorship_requests: [],
      meetings: [],
      messages: [],
      conversations: [],
      notifications: [],
      achievements: [],
      camps: [],
      opportunities: [],
      reports: [],
      saved_items: []
    };
    this._saveTimer = null;
    this._saving = false;
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } catch (err) {
        console.error('Error loading database file, starting clean schema:', err.message);
      }
    }
  }

  /**
   * Debounced async save — coalesces rapid writes into a single disk write.
   * Uses temp-file + rename pattern for crash safety.
   */
  save() {
    if (this._saveTimer) return; // Already scheduled
    this._saveTimer = setTimeout(async () => {
      this._saveTimer = null;
      if (this._saving) return;
      this._saving = true;
      try {
        const json = JSON.stringify(this.data, null, 2);
        await fs.promises.writeFile(DB_TMP_FILE, json, 'utf-8');
        await fs.promises.rename(DB_TMP_FILE, DB_FILE);
      } catch (err) {
        console.error('Failed to save database file:', err.message);
      } finally {
        this._saving = false;
      }
    }, 100); // 100ms debounce
  }

  // Generic DB methods
  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  /**
   * Normalizes a filter argument into a predicate function.
   * - function → used directly
   * - string/number → strict ID-only match (no broad field guessing)
   * - anything else → match nothing
   */
  _normalizeFilter(filterFn) {
    if (typeof filterFn === 'function') return filterFn;
    if (typeof filterFn === 'string' || typeof filterFn === 'number') {
      const val = String(filterFn);
      return item => item.id === val;
    }
    return () => false;
  }

  find(collection, filterFn = () => true) {
    const fn = this._normalizeFilter(filterFn);
    return this.getCollection(collection).filter(fn);
  }

  findOne(collection, filterFn) {
    const fn = this._normalizeFilter(filterFn);
    return this.getCollection(collection).find(fn) || null;
  }

  insert(collection, item) {
    const records = this.getCollection(collection);
    const newItem = {
      id: item.id || uuidv4(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    records.unshift(newItem);
    this.save();
    return newItem;
  }

  update(collection, filterFn, updateFields) {
    const fn = this._normalizeFilter(filterFn);
    const records = this.getCollection(collection);
    let updatedCount = 0;
    records.forEach((rec, idx) => {
      if (fn(rec)) {
        records[idx] = {
          ...rec,
          ...updateFields,
          updatedAt: new Date().toISOString()
        };
        updatedCount++;
      }
    });
    if (updatedCount > 0) this.save();
    return updatedCount;
  }

  delete(collection, filterFn) {
    const fn = this._normalizeFilter(filterFn);
    const records = this.getCollection(collection);
    const initialLen = records.length;
    this.data[collection] = records.filter(rec => !fn(rec));
    const deletedCount = initialLen - this.data[collection].length;
    if (deletedCount > 0) this.save();
    return deletedCount;
  }
}

const db = new LocalDatabase();
module.exports = db;
