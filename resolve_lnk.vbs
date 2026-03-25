Set sh = CreateObject("WScript.Shell")
Set lnk = sh.CreateShortcut(WScript.Arguments(0))
WScript.Echo lnk.TargetPath
