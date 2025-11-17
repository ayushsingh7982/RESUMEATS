#!/usr/bin/env python3
"""
Cleanup Script for Resume ATS Analyzer
Removes temporary uploaded files and old log files

Usage:
    python cleanup.py                    # Interactive mode with confirmation
    python cleanup.py --force            # Delete without confirmation
    python cleanup.py --uploads-only     # Only clean uploads folder
    python cleanup.py --logs-only        # Only clean old logs
    python cleanup.py --days 7           # Clean files older than 7 days
"""

import os
import shutil
import argparse
from datetime import datetime, timedelta
from pathlib import Path


def get_file_age_days(file_path):
    """Get the age of a file in days"""
    file_time = os.path.getmtime(file_path)
    file_date = datetime.fromtimestamp(file_time)
    age = datetime.now() - file_date
    return age.days


def clean_uploads(force=False, days_old=0):
    """Clean the uploads directory"""
    uploads_dir = Path("uploads")
    
    if not uploads_dir.exists():
        print("✓ No uploads directory found. Nothing to clean.")
        return 0
    
    files = list(uploads_dir.glob("*"))
    
    if not files:
        print("✓ Uploads directory is already empty.")
        return 0
    
    # Filter by age if specified
    if days_old > 0:
        files = [f for f in files if f.is_file() and get_file_age_days(f) >= days_old]
    
    if not files:
        print(f"✓ No files older than {days_old} days found in uploads.")
        return 0
    
    print(f"\n📁 Found {len(files)} file(s) in uploads directory:")
    for f in files:
        age = get_file_age_days(f) if f.is_file() else 0
        size = f.stat().st_size if f.is_file() else 0
        print(f"  - {f.name} ({size:,} bytes, {age} days old)")
    
    if not force:
        response = input(f"\n⚠️  Delete these {len(files)} file(s)? (yes/no): ").strip().lower()
        if response not in ['yes', 'y']:
            print("❌ Cleanup cancelled.")
            return 0
    
    deleted = 0
    for f in files:
        try:
            if f.is_file():
                f.unlink()
                deleted += 1
                print(f"  ✓ Deleted: {f.name}")
        except Exception as e:
            print(f"  ✗ Error deleting {f.name}: {e}")
    
    print(f"\n✅ Deleted {deleted} file(s) from uploads directory.")
    return deleted


def clean_logs(force=False, days_old=30):
    """Clean old log files"""
    logs_dir = Path("logs")
    
    if not logs_dir.exists():
        print("✓ No logs directory found. Nothing to clean.")
        return 0
    
    log_files = list(logs_dir.glob("*.log"))
    
    if not log_files:
        print("✓ No log files found.")
        return 0
    
    # Filter by age
    old_logs = [f for f in log_files if get_file_age_days(f) >= days_old]
    
    if not old_logs:
        print(f"✓ No log files older than {days_old} days found.")
        return 0
    
    print(f"\n📋 Found {len(old_logs)} old log file(s):")
    for f in old_logs:
        age = get_file_age_days(f)
        size = f.stat().st_size
        print(f"  - {f.name} ({size:,} bytes, {age} days old)")
    
    if not force:
        response = input(f"\n⚠️  Delete these {len(old_logs)} log file(s)? (yes/no): ").strip().lower()
        if response not in ['yes', 'y']:
            print("❌ Cleanup cancelled.")
            return 0
    
    deleted = 0
    for f in old_logs:
        try:
            f.unlink()
            deleted += 1
            print(f"  ✓ Deleted: {f.name}")
        except Exception as e:
            print(f"  ✗ Error deleting {f.name}: {e}")
    
    print(f"\n✅ Deleted {deleted} log file(s).")
    return deleted


def main():
    parser = argparse.ArgumentParser(
        description="Clean temporary files from Resume ATS Analyzer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python cleanup.py                    # Interactive cleanup
  python cleanup.py --force            # Delete without confirmation
  python cleanup.py --uploads-only     # Only clean uploads
  python cleanup.py --logs-only        # Only clean old logs
  python cleanup.py --days 7           # Clean uploads older than 7 days
  python cleanup.py --log-days 60      # Clean logs older than 60 days
        """
    )
    
    parser.add_argument('--force', '-f', action='store_true',
                        help='Delete files without confirmation')
    parser.add_argument('--uploads-only', action='store_true',
                        help='Only clean uploads directory')
    parser.add_argument('--logs-only', action='store_true',
                        help='Only clean log files')
    parser.add_argument('--days', type=int, default=0,
                        help='Only delete uploads older than N days (default: 0 = all)')
    parser.add_argument('--log-days', type=int, default=30,
                        help='Only delete logs older than N days (default: 30)')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🧹 Resume ATS Analyzer - Cleanup Script")
    print("=" * 60)
    
    total_deleted = 0
    
    # Clean uploads
    if not args.logs_only:
        print("\n📂 Checking uploads directory...")
        total_deleted += clean_uploads(force=args.force, days_old=args.days)
    
    # Clean logs
    if not args.uploads_only:
        print("\n📝 Checking log files...")
        total_deleted += clean_logs(force=args.force, days_old=args.log_days)
    
    print("\n" + "=" * 60)
    print(f"🎉 Cleanup complete! Total files deleted: {total_deleted}")
    print("=" * 60)


if __name__ == "__main__":
    main()
