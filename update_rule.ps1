# Define the URLs
$urls = @(
    "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Bing/Bing.yaml",
	"https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml",
	"https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Google/Google.yaml"
    "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/MicrosoftEdge/MicrosoftEdge.yaml"
)

# Define the output file
$outputFile = "my_merged_rule.yaml"

# Define the custom part markers
$beginMarker = "#---custom begin---"
$endMarker = "#---custom end---"

# Get the content of the old file
$oldContent = Get-Content -Path $outputFile

# Find the lines where the markers are
$beginLine = $oldContent | Select-String -Pattern $beginMarker | Select-Object -ExpandProperty LineNumber
$endLine = $oldContent | Select-String -Pattern $endMarker | Select-Object -ExpandProperty LineNumber

# Extract the custom part
$customPart = $oldContent[($beginLine-1)..($endLine-1)]
$customPartString = $customPart -join "`r`n"
#$customPart = $oldContent[$beginLine..$endLine]

# Retrieve the content from the URLs, remove the line with "payload:", and merge them
<# $$ = foreach ($url in $urls) {
    Invoke-WebRequest -Uri $url | Select-Object -ExpandProperty Content
} #>

# Loop through each URL and retrieve the data
foreach ($url in $urls) {
	try{
		$content = Invoke-WebRequest -Uri $url -UseBasicParsing | Select-Object -ExpandProperty Content

		# Remove lines containing "payload:"
		$content = $content -split "`n" | Where-Object { $_ -notmatch '^\s*payload' }

		# Add the modified content to the array
		$contentArray += $content
	}
	catch {
		Write-Error "An error occurred while processing $url"
    }
}
$mergedContent = $contentArray -join "`r`n"


<# foreach ($url in $urls) {
    try {
        # Retrieve text data from the URL
        $content = Invoke-WebRequest -Uri $url -UseBasicParsing | Select-Object -ExpandProperty Content

        # Split content into individual lines
        $lines = $content -split "`n"

        # Remove any lines containing "payload:"
        $filteredLines = $lines | Where-Object { $_ -notmatch "^(payload:).*" }

        # Append filteredLines to the StringBuilder object, add a newline between files
        [void]$mergedData.AppendLine(($filteredLines -join "`n") + "`n")
    }
    catch {
        Write-Error "An error occurred while processing $url"
    }
}
$mergedContent = $mergedData.ToString() #>

# Get the current timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Combine the custom part and the merged content
#$finalContent = $customPart + $mergedContent
$finalContent = "# Updated on $timestamp`r`n" + $customPartString + "`r`n" + $mergedContent

# Write the final content to the output file
$finalContent | Out-File -FilePath $outputFile