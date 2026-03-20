@echo off
echo Starting copy process... > copy_log.txt

echo Copying to Admin Service... >> copy_log.txt
mkdir admin-service\src\controllers >> copy_log.txt 2>&1
xcopy src\controllers admin-service\src\controllers /E /I /Y >> copy_log.txt 2>&1
mkdir admin-service\src\routes >> copy_log.txt 2>&1
xcopy src\routes admin-service\src\routes /E /I /Y >> copy_log.txt 2>&1
mkdir admin-service\src\models >> copy_log.txt 2>&1
xcopy src\models admin-service\src\models /E /I /Y >> copy_log.txt 2>&1
mkdir admin-service\src\middleware >> copy_log.txt 2>&1
xcopy src\middleware admin-service\src\middleware /E /I /Y >> copy_log.txt 2>&1
mkdir admin-service\src\utils >> copy_log.txt 2>&1
xcopy src\utils admin-service\src\utils /E /I /Y >> copy_log.txt 2>&1
mkdir admin-service\src\services >> copy_log.txt 2>&1
xcopy src\services admin-service\src\services /E /I /Y >> copy_log.txt 2>&1

echo Copying to Faculty Service... >> copy_log.txt
mkdir faculty-service\src\controllers >> copy_log.txt 2>&1
xcopy src\controllers faculty-service\src\controllers /E /I /Y >> copy_log.txt 2>&1
mkdir faculty-service\src\routes >> copy_log.txt 2>&1
xcopy src\routes faculty-service\src\routes /E /I /Y >> copy_log.txt 2>&1
mkdir faculty-service\src\models >> copy_log.txt 2>&1
xcopy src\models faculty-service\src\models /E /I /Y >> copy_log.txt 2>&1
mkdir faculty-service\src\middleware >> copy_log.txt 2>&1
xcopy src\middleware faculty-service\src\middleware /E /I /Y >> copy_log.txt 2>&1
mkdir faculty-service\src\utils >> copy_log.txt 2>&1
xcopy src\utils faculty-service\src\utils /E /I /Y >> copy_log.txt 2>&1
mkdir faculty-service\src\services >> copy_log.txt 2>&1
xcopy src\services faculty-service\src\services /E /I /Y >> copy_log.txt 2>&1

echo Copying to Student Service... >> copy_log.txt
mkdir student-service\src\controllers >> copy_log.txt 2>&1
xcopy src\controllers student-service\src\controllers /E /I /Y >> copy_log.txt 2>&1
mkdir student-service\src\routes >> copy_log.txt 2>&1
xcopy src\routes student-service\src\routes /E /I /Y >> copy_log.txt 2>&1
mkdir student-service\src\models >> copy_log.txt 2>&1
xcopy src\models student-service\src\models /E /I /Y >> copy_log.txt 2>&1
mkdir student-service\src\middleware >> copy_log.txt 2>&1
xcopy src\middleware student-service\src\middleware /E /I /Y >> copy_log.txt 2>&1
mkdir student-service\src\utils >> copy_log.txt 2>&1
xcopy src\utils student-service\src\utils /E /I /Y >> copy_log.txt 2>&1
mkdir student-service\src\services >> copy_log.txt 2>&1
xcopy src\services student-service\src\services /E /I /Y >> copy_log.txt 2>&1

echo Done. >> copy_log.txt
