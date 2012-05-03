#!/usr/bin/env ruby

# default task
task :default => 'SO:build'

namespace :SO do
	desc 'Builds both userscript and prettify extension JS files from templates'
	task :build do
		for name in %w[lang-matlab.js prettify-matlab.user.js switch-lang.user.js]
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

# process file by parsing //=INSERT_FILE*= instructions
# Adapted from: https://github.com/mislav/user-scripts/blob/master/Thorfile
def process_file(source, target)
	# read source line-by-line.
	for line in source
		case line
		# if match '//=INSERT_FILE=' or '//=INSERT_FILE_AS_STRINGS=' instructions
		when %r{^(\s*)//=INSERT_FILE(_AS_STRINGS)?=\s+(.*)$}
			# get indentation and name of file to insert
			indentation, asStrings, filename = $1, $2, $3
			filename = File.join(File.dirname(source.path), filename.strip)
			filename = File.expand_path(filename)

			if File.exist?(filename)
				# write source file into target (with same indentation level)
				file = File.open(filename, 'r')
				for insert_line in file
					target << indentation
					if asStrings
						# write as: 'insert_line',
						target << "'" << insert_line.gsub(/[\r\n]*$/,'') << "',\n"
					else
						target << insert_line
					end
				end
			else
				# warn user and pass line unchanged
				puts "WARNING: file not found #{filename}"
				target << line
				next
			end

		# else pass the line unchanged to target
		else
			target << line
		end
	end
end
