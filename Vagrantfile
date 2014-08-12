# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "hashicorp/precise64"

  # prepare x11 forwarding so that we can run the gui on inside vagrant
  config.ssh.forward_x11 = true

  config.vm.network "forwarded_port", guest: 80, host: 8989

  config.vm.provision :shell, path: "provision.sh"
  config.vm.provision :shell, :inline => "sudo initctl emit vagrant-ready"
end