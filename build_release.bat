@echo off
set "JAVA_HOME=D:\Android\Android Studio\jbr"
set "ANDROID_HOME=D:\Android\Sdk"
cd /d "D:\Projects\AndroidCoding\08_uWIP\uwipRN\android"
call "D:\Projects\AndroidCoding\08_uWIP\uwipRN\android\gradlew.bat" assembleRelease
