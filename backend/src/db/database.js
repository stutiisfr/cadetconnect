const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'cadetconnect_db.json');

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

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err.message);
    }
  }

  // Generic DB methods
  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  find(collection, filterFn = () => true) {
    return this.getCollection(collection).filter(filterFn);
  }

  findOne(collection, filterFn) {
    return this.getCollection(collection).find(filterFn) || null;
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
    const records = this.getCollection(collection);
    let updatedCount = 0;
    records.forEach((rec, idx) => {
      if (filterFn(rec)) {
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
    const records = this.getCollection(collection);
    const initialLen = records.length;
    this.data[collection] = records.filter(rec => !filterFn(rec));
    const deletedCount = initialLen - this.data[collection].length;
    if (deletedCount > 0) this.save();
    return deletedCount;
  }
}

const db = new LocalDatabase();
module.exports = db;
