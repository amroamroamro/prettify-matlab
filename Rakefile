#!/usr/bin/env ruby

# default task
task :default => 'SO:build'

# source files to be processed
SOURCES = %w[lang-matlab.js prettify-matlab.user.js switch-lang.user.js prettify-mathworks-answers.user.js prettify-mathworks-fileexchange.user.js]

namespace :SO do
	desc 'Builds both userscript and prettify extension JS files from templates'
	task :build do
		for name in SOURCES
			source = File.open("src/#{name}", 'r')
			target = File.open("js/#{name}", 'w')

			puts "Building #{target.path}"

			begin
				process_file(source, target)
			ensure
				source.close
				target.close
			end
		end
	end
	
	desc 'Run watchr'
	task :watchr do
		require 'rubygems'
		require 'watchr'
		script = Watchr::Script.new
		all_files = [Dir['src/*.js'], Dir['css/*.css']].join('|')
		script.watch(all_files) do |file|
			Rake::Task["SO:build"].execute
		end
		controller = Watchr::Controller.new(script, Watchr.handler.new)
		controller.run
	end
end

require 'tempfile'

# process file by parsing //=INSERT_FILE*= instructions recursively
# Adapted from: https://github.com/mislav/user-scripts/blob/master/Thorfile
def process_file(source, target)
	# read source line-by-line.
	for line in source
		case line
		# match instructions: INSERT/RENDER, QUOTED, CONCATED
		when %r{^(\s*)//=(INSERT|RENDER)_FILE(_QUOTED)?(_CONCATED)?=\s+(.*)$}
			# get indentation, process mode, quoted lines, concatenated lines, and name of file to insert
			indentation, processMode, doQuote, doConcat, filename = $1, $2, $3, $4, $5

			# check file exists
			filename = File.join(File.dirname(source.path), filename.strip)		# path relative to source
			filename = File.expand_path(filename)
			if not File.exist?(filename)
				# warn user and pass line unchanged
				puts "WARNING: file not found #{filename}"
				target << line
				next
			end

			# INSERT vs. RENDER
			if processMode == 'RENDER'
				template = File.open(filename, 'r')
				tmp = Tempfile.new(File.basename(filename))	# create temp file to write to
				begin
					process_file(template, tmp)
					# for the following, use the processed file instead of the raw one
					filename = tmp.path
				ensure
					template.close
					tmp.close
				end
			end

			# concatenate all file lines by "|" as one string
			if doConcat
				# read file lines and join by "|"
				insert_line = File.readlines(filename).map(&:rstrip).join('|')

				# write concatenated line
				target << indentation			# keep same level of indentation
				target << (doQuote ? quote_string(insert_line,false) : insert_line)
				target << "\n"					# insert new line at the end (was chopped by rstrip)

			# write file lines one-by-one
			else
				file = File.open(filename, 'r')
				for insert_line in file
					target << indentation		# keep same level of indentation
					target << (doQuote ? quote_string(insert_line) : insert_line)
				end
				file.close
			end

			if processMode == 'RENDER'
				# delete temporary file
				tmp.unlink
			end

		# else pass the line unchanged to target
		else
			target << line
		end
	end
end

# returns: 'str',
def quote_string(str, doTrailComma=true)
	ret = "'" + str.gsub(/(\r\n?)$/,'') + "'"
	ret += "," if doTrailComma
	ret += $1 if not $1.nil?
	ret
end
